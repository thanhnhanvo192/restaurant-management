import Table from "../../models/table.model.js";
import Booking from "../../models/booking.model.js";
import { fail, ok } from "../../utils/response.js";

const deriveFloor = (area) => {
  const normalized = String(area || "").toLowerCase();

  if (normalized.includes("vip")) {
    return "vip";
  }

  if (
    normalized.includes("1") ||
    normalized.includes("lầu 1") ||
    normalized.includes("floor1")
  ) {
    return "floor1";
  }

  return "ground";
};

const toTableResponse = (table) => ({
  id: table._id,
  tableNumber: table.tableNumber,
  area: table.area,
  floor: deriveFloor(table.area),
  capacity: table.capacity,
  seats: table.capacity,
  status: table.status,
  isAvailable: table.status === "available",
});

export const getCustomerTables = async (_req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  return ok(
    res,
    { tables: tables.map(toTableResponse) },
    "Lấy danh sách bàn thành công",
  );
};

export const getBookableTableById = async (req, res) => {
  const { id } = req.params;
  const table = await Table.findById(id);

  if (!table) {
    return fail(res, 404, "Không tìm thấy bàn", "TABLE_NOT_FOUND");
  }

  return ok(
    res,
    { table: toTableResponse(table) },
    "Lấy thông tin bàn thành công",
  );
};

export const getTableSnapshot = async (tableId) => {
  const table = await Table.findById(tableId);

  if (!table) {
    return null;
  }

  return {
    id: table._id,
    tableNumber: table.tableNumber,
    area: table.area,
    floor: deriveFloor(table.area),
    capacity: table.capacity,
    seats: table.capacity,
    status: table.status,
  };
};

export const markTableReservedIfNeeded = async (tableId, session = null) => {
  const table = await Table.findById(tableId).session(session || undefined);

  if (!table) {
    return null;
  }

  if (table.status !== "available") {
    return table;
  }

  table.status = "reserved";
  await table.save({ session: session || undefined });
  return table;
};

export const releaseTableIfPossible = async (tableId, session = null) => {
  const table = await Table.findById(tableId).session(session || undefined);

  if (!table) {
    return null;
  }

  if (table.status === "reserved") {
    table.status = "available";
    await table.save({ session: session || undefined });
  }

  return table;
};

export const hasActiveBookingConflict = async (
  tableId,
  bookingDate,
  bookingTime,
) => {
  const conflict = await Booking.findOne({
    tableId,
    bookingDate,
    bookingTime,
    status: { $in: ["pending", "confirmed"] },
  });

  return Boolean(conflict);
};
