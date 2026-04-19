import Order from "../../models/order.model.js";
import Customer from "../../models/customer.model.js";
import Table from "../../models/table.model.js";
import Menu from "../../models/menu.model.js";
import logger from "../../utils/logger.js";
import { fail, ok } from "../../utils/response.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEK_TREND_LENGTH = 8;

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
  const todayStart = toUtcStartOfDay(now);
  const period = ["today", "week", "month"].includes(query.period)
    ? query.period
    : "week";

  if (
    query.from &&
    query.to &&
    isValidDate(query.from) &&
    isValidDate(query.to)
  ) {
    const fromDate = toUtcStartOfDay(query.from);
    const toDate = toUtcEndOfDay(query.to);

    if (fromDate <= toDate) {
      return {
        period,
        fromDate,
        toDate,
      };
    }
  }

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

const getIsoWeekData = (dateInput) => {
  const date = new Date(
    Date.UTC(
      dateInput.getUTCFullYear(),
      dateInput.getUTCMonth(),
      dateInput.getUTCDate(),
    ),
  );
  const dayNumber = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / MS_PER_DAY + 1) / 7);
  return {
    year: date.getUTCFullYear(),
    week,
  };
};

const buildDailyTrend = (dailyRevenueRows, fromDate, toDate) => {
  const revenueMap = new Map(
    dailyRevenueRows.map((row) => [row.date, Number(row.revenue || 0)]),
  );

  const points = [];
  for (
    let cursor = fromDate.getTime();
    cursor <= toDate.getTime();
    cursor += MS_PER_DAY
  ) {
    const currentDate = new Date(cursor).toISOString().slice(0, 10);
    points.push({
      date: currentDate,
      label: formatDateLabel(currentDate),
      revenue: revenueMap.get(currentDate) || 0,
    });
  }

  return points;
};

const buildWeeklyTrend = (weeklyRevenueRows, endDate) => {
  const rows = new Map(
    weeklyRevenueRows.map((row) => [
      `${row.year}-W${String(row.week).padStart(2, "0")}`,
      Number(row.revenue || 0),
    ]),
  );

  const points = [];
  for (let index = WEEK_TREND_LENGTH - 1; index >= 0; index -= 1) {
    const targetDate = new Date(endDate.getTime() - index * 7 * MS_PER_DAY);
    const { year, week } = getIsoWeekData(targetDate);
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    points.push({
      week: key,
      label: key,
      revenue: rows.get(key) || 0,
    });
  }

  return points;
};

// [GET] /admin/dashboard
export const getDashboardData = async (req, res) => {
  try {
    const { period, fromDate, toDate } = parseRange(req.query);

    const [
      orderSummaryRows,
      dailyRevenueRows,
      weeklyRevenueRows,
      topCategoryRows,
      totalTables,
      tableStatusRows,
      newCustomers,
      totalMenus,
      topMenuRows,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
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
        {
          $match: {
            status: "completed",
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $project: { _id: 0, date: "$_id", revenue: 1 } },
        { $sort: { date: 1 } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $isoWeekYear: "$createdAt" },
              week: { $isoWeek: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            week: "$_id.week",
            revenue: 1,
          },
        },
        { $sort: { year: 1, week: 1 } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: { $ifNull: ["$items.categoryId", "unknown"] },
            quantity: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
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
        { $limit: 5 },
      ]),
      Table.countDocuments(),
      Table.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
      Customer.countDocuments({
        createdAt: { $gte: fromDate, $lte: toDate },
      }),
      Menu.countDocuments(),
      Menu.aggregate([
        { $sort: { soldCount: -1, createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: 1,
            soldCount: 1,
            price: 1,
          },
        },
      ]),
    ]);

    const orderSummary = orderSummaryRows[0] || {};
    const tableStatusMap = tableStatusRows.reduce((accumulator, item) => {
      accumulator[item.status] = item.count;
      return accumulator;
    }, {});

    const dailyRevenue = buildDailyTrend(dailyRevenueRows, fromDate, toDate);
    const weeklyRevenue = buildWeeklyTrend(weeklyRevenueRows, toDate);

    return ok(
      res,
      {
        dashboard: {
          period,
          dateRange: {
            from: fromDate.toISOString().slice(0, 10),
            to: toDate.toISOString().slice(0, 10),
          },
          summaryStats: {
            totalRevenue: Number(orderSummary.totalRevenue || 0),
            totalOrders: Number(orderSummary.totalOrders || 0),
            completedOrders: Number(orderSummary.completedOrders || 0),
            newCustomers: Number(newCustomers || 0),
            totalTables: Number(totalTables || 0),
            availableTables: Number(tableStatusMap.available || 0),
            occupiedTables: Number(tableStatusMap.occupied || 0),
            reservedTables: Number(tableStatusMap.reserved || 0),
            cleaningTables: Number(tableStatusMap.cleaning || 0),
            totalMenus: Number(totalMenus || 0),
          },
          trends: {
            dailyRevenue,
            weeklyRevenue,
          },
          top: {
            menus: topMenuRows,
            categories: topCategoryRows,
          },
        },
      },
      "Lấy dữ liệu dashboard thành công",
    );
  } catch (error) {
    logger.error("Không thể lấy dữ liệu dashboard", {
      message: error?.message,
    });
    return fail(
      res,
      500,
      "Lỗi khi lấy dữ liệu dashboard",
      "DASHBOARD_FETCH_FAILED",
    );
  }
};
