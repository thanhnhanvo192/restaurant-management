import Order from "../../models/order.model.js";
import Customer from "../../models/customer.model.js";
import Staff from "../../models/staff.model.js";
import logger from "../../utils/logger.js";
import { fail, ok } from "../../utils/response.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_PERIOD = "week";
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
  "canceled",
];
const PAYMENT_METHODS = ["cash", "card", "transfer"];
const STAFF_ROLES = ["admin", "waiter", "kitchen"];

const toUtcStartOfDay = (value) => {
  const date = new Date(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const toUtcEndOfDay = (value) => {
  const start = toUtcStartOfDay(value);
  return new Date(start.getTime() + MS_PER_DAY - 1);
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const formatDateLabel = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const parseRange = (query) => {
  const now = new Date();
  const period = ["today", "week", "month", "custom"].includes(query.period)
    ? query.period
    : DEFAULT_PERIOD;

  const hasFrom = query.from !== undefined;
  const hasTo = query.to !== undefined;

  if (hasFrom || hasTo || period === "custom") {
    if (!query.from || !query.to) {
      return {
        error: {
          message: "Khoảng thời gian không hợp lệ",
          details: [
            {
              field: "from_to",
              message: "Cần truyền đầy đủ from và to cho bộ lọc custom",
            },
          ],
        },
      };
    }

    if (!isValidDate(query.from) || !isValidDate(query.to)) {
      return {
        error: {
          message: "Định dạng ngày không hợp lệ",
          details: [
            {
              field: "from_to",
              message: "from/to phải là ngày hợp lệ theo ISO-8601",
            },
          ],
        },
      };
    }

    const fromDate = toUtcStartOfDay(query.from);
    const toDate = toUtcEndOfDay(query.to);

    if (fromDate > toDate) {
      return {
        error: {
          message: "Khoảng thời gian không hợp lệ",
          details: [
            {
              field: "from_to",
              message: "from phải nhỏ hơn hoặc bằng to",
            },
          ],
        },
      };
    }

    return {
      period,
      fromDate,
      toDate,
    };
  }

  const todayStart = toUtcStartOfDay(now);

  if (period === "today") {
    return {
      period,
      fromDate: todayStart,
      toDate: toUtcEndOfDay(now),
    };
  }

  if (period === "month") {
    return {
      period,
      fromDate: new Date(todayStart.getTime() - 29 * MS_PER_DAY),
      toDate: toUtcEndOfDay(now),
    };
  }

  return {
    period,
    fromDate: new Date(todayStart.getTime() - 6 * MS_PER_DAY),
    toDate: toUtcEndOfDay(now),
  };
};

const buildRevenueSeries = (rows, fromDate, toDate) => {
  const rowMap = new Map(
    rows.map((row) => [
      row.date,
      {
        revenue: Number(row.revenue || 0),
        orders: Number(row.orders || 0),
      },
    ]),
  );

  const series = [];
  for (
    let cursor = fromDate.getTime();
    cursor <= toDate.getTime();
    cursor += MS_PER_DAY
  ) {
    const isoDate = new Date(cursor).toISOString().slice(0, 10);
    const point = rowMap.get(isoDate) || { revenue: 0, orders: 0 };
    series.push({
      date: isoDate,
      label: formatDateLabel(isoDate),
      revenue: point.revenue,
      orders: point.orders,
    });
  }

  return series;
};

const withDefaultStatusRows = (rows) => {
  const rowMap = new Map(
    rows.map((row) => [row.status, Number(row.count || 0)]),
  );
  return ORDER_STATUSES.map((status) => ({
    status,
    count: rowMap.get(status) || 0,
  }));
};

const withDefaultPaymentRows = (rows) => {
  const rowMap = new Map(
    rows.map((row) => [
      row.paymentMethod,
      {
        count: Number(row.count || 0),
        revenue: Number(row.revenue || 0),
      },
    ]),
  );

  return PAYMENT_METHODS.map((paymentMethod) => ({
    paymentMethod,
    count: rowMap.get(paymentMethod)?.count || 0,
    revenue: rowMap.get(paymentMethod)?.revenue || 0,
  }));
};

const withDefaultStaffRows = (totalsByRoleRows, newByRoleRows) => {
  const totalsMap = new Map(
    totalsByRoleRows.map((row) => [
      row.role,
      {
        count: Number(row.count || 0),
        activeCount: Number(row.activeCount || 0),
      },
    ]),
  );
  const newMap = new Map(
    newByRoleRows.map((row) => [row.role, Number(row.newInPeriod || 0)]),
  );

  return STAFF_ROLES.map((role) => {
    const count = totalsMap.get(role)?.count || 0;
    const activeCount = totalsMap.get(role)?.activeCount || 0;
    const inactiveCount = Math.max(0, count - activeCount);
    return {
      role,
      count,
      activeCount,
      inactiveCount,
      newInPeriod: newMap.get(role) || 0,
    };
  });
};

const normalizeCategoryRows = (rows) => {
  const totalCategoryRevenue = rows.reduce(
    (accumulator, row) => accumulator + Number(row.revenue || 0),
    0,
  );

  return rows.map((row) => {
    const revenue = Number(row.revenue || 0);
    return {
      categoryId: row.categoryId || "unknown",
      quantity: Number(row.quantity || 0),
      revenue,
      sharePercent:
        totalCategoryRevenue > 0
          ? Number(((revenue / totalCategoryRevenue) * 100).toFixed(2))
          : 0,
    };
  });
};

// [GET] /admin/statistics
export const getStatistics = async (req, res) => {
  const range = parseRange(req.query);
  if (range.error) {
    return fail(
      res,
      400,
      range.error.message,
      "STATISTICS_INVALID_DATE_RANGE",
      range.error.details,
    );
  }

  const { period, fromDate, toDate } = range;

  try {
    const baseMatch = {
      createdAt: { $gte: fromDate, $lte: toDate },
    };

    const [
      summaryRows,
      revenueSeriesRows,
      statusRows,
      paymentRows,
      categoryRows,
      newCustomers,
      staffTotalsByRoleRows,
      newStaffByRoleRows,
    ] = await Promise.all([
      Order.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            canceledOrders: {
              $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] },
            },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
              },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            orders: 1,
            revenue: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
      Order.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
      Order.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            paymentMethod: "$_id",
            count: 1,
            revenue: 1,
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            ...baseMatch,
            status: "completed",
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: { $ifNull: ["$items.categoryId", "unknown"] },
            quantity: { $sum: "$items.quantity" },
            revenue: {
              $sum: {
                $multiply: ["$items.quantity", "$items.unitPrice"],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            categoryId: "$_id",
            quantity: 1,
            revenue: 1,
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Customer.countDocuments({
        createdAt: { $gte: fromDate, $lte: toDate },
      }),
      Staff.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$active", true] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            role: "$_id",
            count: 1,
            activeCount: 1,
          },
        },
      ]),
      Staff.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: "$role",
            newInPeriod: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            role: "$_id",
            newInPeriod: 1,
          },
        },
      ]),
    ]);

    const summary = summaryRows[0] || {};
    const totalOrders = Number(summary.totalOrders || 0);
    const totalRevenue = Number(summary.totalRevenue || 0);

    const statusBreakdown = withDefaultStatusRows(statusRows);
    const paymentMethodBreakdown = withDefaultPaymentRows(paymentRows);
    const categoryBreakdown = normalizeCategoryRows(categoryRows);
    const staffBreakdown = withDefaultStaffRows(
      staffTotalsByRoleRows,
      newStaffByRoleRows,
    );

    return ok(
      res,
      {
        statistics: {
          period,
          dateRange: {
            from: fromDate.toISOString().slice(0, 10),
            to: toDate.toISOString().slice(0, 10),
          },
          summary: {
            totalRevenue,
            totalOrders,
            completedOrders: Number(summary.completedOrders || 0),
            canceledOrders: Number(summary.canceledOrders || 0),
            averageOrderValue:
              totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            newCustomers: Number(newCustomers || 0),
          },
          charts: {
            revenueSeries: buildRevenueSeries(
              revenueSeriesRows,
              fromDate,
              toDate,
            ),
            statusBreakdown,
            paymentMethodBreakdown,
            categoryBreakdown,
            staffBreakdown,
          },
          top: {
            categories: categoryBreakdown.slice(0, 5),
            staffRoles: [...staffBreakdown].sort((a, b) => b.count - a.count),
          },
        },
      },
      "Lấy thống kê thành công",
    );
  } catch (error) {
    logger.error("Không thể lấy dữ liệu thống kê", {
      message: error?.message,
    });
    return fail(
      res,
      500,
      "Lỗi khi lấy dữ liệu thống kê",
      "STATISTICS_FETCH_FAILED",
    );
  }
};
