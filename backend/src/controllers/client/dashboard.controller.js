import Booking from "../../models/booking.model.js";
import Order from "../../models/order.model.js";
import { ok } from "../../utils/response.js";

const toOrderSummary = (order) => ({
  id: order._id,
  orderCode: order.orderCode,
  date: order.createdAt,
  time: order.createdAt,
  total: order.totalAmount,
  status: order.status,
});

const toBookingSummary = (booking) => ({
  id: booking._id,
  bookingCode: booking.bookingCode,
  tableId: booking.tableId,
  bookingDate: booking.bookingDate,
  bookingTime: booking.bookingTime,
  guestCount: booking.guestCount,
  status: booking.status,
});

export const getCustomerDashboard = async (req, res) => {
  const customerId = req.auth.customer._id;

  const [recentOrders, upcomingBookings, ordersCount, totalSpent] =
    await Promise.all([
      Order.find({ customerId }).sort({ createdAt: -1 }).limit(5),
      Booking.find({ customerId, status: { $in: ["pending", "confirmed"] } })
        .sort({ bookingDate: 1, bookingTime: 1 })
        .limit(5),
      Order.countDocuments({ customerId }),
      Order.aggregate([
        { $match: { customerId } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

  const totalSpentValue = totalSpent[0]?.total || 0;

  return ok(
    res,
    {
      summary: {
        totalOrders: ordersCount,
        totalSpent: totalSpentValue,
        upcomingBookings: upcomingBookings.length,
        loyaltyPoints: req.auth.customer.points || 0,
      },
      recentOrders: recentOrders.map(toOrderSummary),
      recentBookings: upcomingBookings.map(toBookingSummary),
      customer: {
        id: req.auth.customer._id,
        name: req.auth.customer.name,
        tier: req.auth.customer.tier,
        avatarUrl: req.auth.customer.avatarUrl || "",
      },
    },
    "Lấy dashboard khách hàng thành công",
  );
};
