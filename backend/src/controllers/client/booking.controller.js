import mongoose from "mongoose";

import Booking from "../../models/booking.model.js";
import {
  getTableSnapshot,
  hasActiveBookingConflict,
  markTableReservedIfNeeded,
  releaseTableIfPossible,
} from "./table.controller.js";
import { created, fail, ok } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const bookingCode = () =>
  `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const isTransactionUnsupportedError = (error) => {
  const message = String(error?.message || "");
  return (
    message.includes("Transaction numbers are only allowed") ||
    message.includes("replica set member or mongos")
  );
};

const toBookingResponse = (booking) => ({
  id: booking._id,
  bookingCode: booking.bookingCode,
  customerId: booking.customerId,
  tableId: booking.tableId,
  table: booking.tableSnapshot,
  bookingDate: booking.bookingDate,
  bookingTime: booking.bookingTime,
  guestCount: booking.guestCount,
  specialNote: booking.specialNote || "",
  status: booking.status,
  canceledAt: booking.canceledAt,
  cancelReason: booking.cancelReason || "",
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

const validateBookingPayload = async ({
  tableId,
  bookingDate,
  bookingTime,
  guestCount,
}) => {
  if (
    !tableId ||
    !bookingDate ||
    !bookingTime ||
    guestCount === undefined ||
    guestCount === null
  ) {
    return "Thiếu dữ liệu bắt buộc: tableId, bookingDate, bookingTime, guestCount";
  }

  const tableSnapshot = await getTableSnapshot(tableId);

  if (!tableSnapshot) {
    return "Không tìm thấy bàn";
  }

  if (tableSnapshot.status !== "available") {
    return "Bàn này hiện không còn trống";
  }

  const guestCountNumber = Number(guestCount);

  if (
    !Number.isInteger(guestCountNumber) ||
    guestCountNumber < 1 ||
    guestCountNumber > 12
  ) {
    return "Số khách hợp lệ từ 1 đến 12";
  }

  if (guestCountNumber > tableSnapshot.seats) {
    return `Bàn này chỉ phù hợp tối đa ${tableSnapshot.seats} khách`;
  }

  const conflict = await hasActiveBookingConflict(
    tableId,
    bookingDate,
    bookingTime,
  );

  if (conflict) {
    return "Khung giờ này đã có người đặt bàn";
  }

  return null;
};

export const createBooking = async (req, res) => {
  const {
    tableId,
    bookingDate,
    bookingTime,
    guestCount,
    specialNote = "",
  } = req.body;

  const validationMessage = await validateBookingPayload({
    tableId,
    bookingDate,
    bookingTime,
    guestCount,
  });

  if (validationMessage) {
    return fail(res, 400, validationMessage, "BOOKING_INVALID_PAYLOAD");
  }

  const persistBooking = async (session = null) => {
    const tableSnapshot = await getTableSnapshot(tableId);
    const reservedTable = await markTableReservedIfNeeded(tableId, session);

    if (!reservedTable) {
      throw new Error("Không tìm thấy bàn");
    }

    const bookingPayload = {
      bookingCode: bookingCode(),
      customerId: req.auth.customer._id,
      customerSnapshot: {
        name: req.auth.customer.name,
        phone: req.auth.customer.phone,
        email: req.auth.customer.email || "",
      },
      tableId: reservedTable._id,
      tableSnapshot,
      bookingDate,
      bookingTime,
      guestCount: Number(guestCount),
      specialNote,
      status: "confirmed",
    };

    if (session) {
      const [booking] = await Booking.create([bookingPayload], { session });
      return booking;
    }

    const [booking] = await Booking.create([bookingPayload]);
    return booking;
  };

  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await persistBooking(session);

    await session.commitTransaction();

    return created(
      res,
      { booking: toBookingResponse(booking) },
      "Đặt bàn thành công",
    );
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    if (isTransactionUnsupportedError(error)) {
      try {
        const booking = await persistBooking();
        return created(
          res,
          { booking: toBookingResponse(booking) },
          "Đặt bàn thành công",
        );
      } catch (fallbackError) {
        if (fallbackError?.code === 11000) {
          return fail(
            res,
            409,
            "Khung giờ này đã có người đặt bàn",
            "BOOKING_CONFLICT",
          );
        }

        logger.error("Không thể tạo booking (fallback)", {
          message: fallbackError?.message,
        });
        return fail(
          res,
          500,
          fallbackError.message || "Không thể tạo booking",
          "BOOKING_CREATE_FAILED",
        );
      }
    }

    if (error?.code === 11000) {
      return fail(
        res,
        409,
        "Khung giờ này đã có người đặt bàn",
        "BOOKING_CONFLICT",
      );
    }

    logger.error("Không thể tạo booking", { message: error?.message });
    return fail(
      res,
      500,
      error.message || "Không thể tạo booking",
      "BOOKING_CREATE_FAILED",
    );
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const getBookings = async (req, res) => {
  const bookings = await Booking.find({
    customerId: req.auth.customer._id,
  }).sort({ createdAt: -1 });
  return ok(
    res,
    { bookings: bookings.map(toBookingResponse) },
    "Lấy danh sách booking thành công",
  );
};

export const getBookingById = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findOne({
    _id: id,
    customerId: req.auth.customer._id,
  });

  if (!booking) {
    return fail(res, 404, "Không tìm thấy booking", "BOOKING_NOT_FOUND");
  }

  return ok(
    res,
    { booking: toBookingResponse(booking) },
    "Lấy thông tin booking thành công",
  );
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findOne({
    _id: id,
    customerId: req.auth.customer._id,
  });

  if (!booking) {
    return fail(res, 404, "Không tìm thấy booking", "BOOKING_NOT_FOUND");
  }

  if (booking.status === "canceled") {
    return fail(res, 409, "Booking này đã bị hủy", "BOOKING_ALREADY_CANCELED");
  }

  if (booking.status === "completed") {
    return fail(
      res,
      409,
      "Booking đã hoàn tất, không thể hủy",
      "BOOKING_COMPLETED",
    );
  }

  booking.status = "canceled";
  booking.canceledAt = new Date();
  booking.cancelReason = "Customer canceled";
  await booking.save();

  await releaseTableIfPossible(booking.tableId);

  return ok(res, {}, "Hủy booking thành công");
};
