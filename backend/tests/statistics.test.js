import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const OrderMock = {
  aggregate: jest.fn(),
};

const CustomerMock = {
  countDocuments: jest.fn(),
};

const StaffMock = {
  aggregate: jest.fn(),
};

jest.unstable_mockModule("../src/models/order.model.js", () => ({
  default: OrderMock,
}));

jest.unstable_mockModule("../src/models/customer.model.js", () => ({
  default: CustomerMock,
}));

jest.unstable_mockModule("../src/models/staff.model.js", () => ({
  default: StaffMock,
}));

const { getStatistics } =
  await import("../src/controllers/admin/statistic.controller.js");

const createApp = () => {
  const app = express();
  app.get("/admin/statistics", getStatistics);
  return app;
};

describe("Admin Statistics API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    OrderMock.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    CustomerMock.countDocuments.mockResolvedValue(0);

    StaffMock.aggregate.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
  });

  it("GET /admin/statistics returns zero-state payload", async () => {
    const response = await request(createApp()).get("/admin/statistics");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Lấy thống kê thành công");

    const { statistics } = response.body.data;
    expect(statistics.summary.totalRevenue).toBe(0);
    expect(statistics.summary.totalOrders).toBe(0);
    expect(statistics.summary.newCustomers).toBe(0);
    expect(statistics.charts.revenueSeries.length).toBeGreaterThan(0);
    expect(
      statistics.charts.revenueSeries.every(
        (point) => point.revenue === 0 && point.orders === 0,
      ),
    ).toBe(true);
    expect(statistics.charts.statusBreakdown).toHaveLength(5);
    expect(statistics.charts.paymentMethodBreakdown).toHaveLength(3);
    expect(statistics.charts.staffBreakdown).toHaveLength(3);
  });

  it("GET /admin/statistics supports custom date-range and aggregations", async () => {
    OrderMock.aggregate.mockReset();
    OrderMock.aggregate
      .mockResolvedValueOnce([
        {
          totalOrders: 20,
          completedOrders: 15,
          canceledOrders: 3,
          totalRevenue: 1200000,
        },
      ])
      .mockResolvedValueOnce([
        { date: "2026-04-01", orders: 6, revenue: 300000 },
        { date: "2026-04-02", orders: 7, revenue: 420000 },
      ])
      .mockResolvedValueOnce([
        { status: "completed", count: 15 },
        { status: "canceled", count: 3 },
        { status: "pending", count: 2 },
      ])
      .mockResolvedValueOnce([
        { paymentMethod: "cash", count: 11, revenue: 700000 },
        { paymentMethod: "card", count: 9, revenue: 500000 },
      ])
      .mockResolvedValueOnce([
        { categoryId: "mon-chinh", quantity: 32, revenue: 820000 },
        { categoryId: "do-uong", quantity: 18, revenue: 380000 },
      ]);

    CustomerMock.countDocuments.mockResolvedValue(5);

    StaffMock.aggregate.mockReset();
    StaffMock.aggregate
      .mockResolvedValueOnce([
        { role: "waiter", count: 10, activeCount: 8 },
        { role: "kitchen", count: 6, activeCount: 5 },
        { role: "admin", count: 2, activeCount: 2 },
      ])
      .mockResolvedValueOnce([
        { role: "waiter", newInPeriod: 1 },
        { role: "kitchen", newInPeriod: 2 },
      ]);

    const response = await request(createApp()).get("/admin/statistics").query({
      period: "custom",
      from: "2026-04-01",
      to: "2026-04-03",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { statistics } = response.body.data;
    expect(statistics.period).toBe("custom");
    expect(statistics.dateRange.from).toBe("2026-04-01");
    expect(statistics.dateRange.to).toBe("2026-04-03");

    expect(statistics.summary.totalRevenue).toBe(1200000);
    expect(statistics.summary.totalOrders).toBe(20);
    expect(statistics.summary.completedOrders).toBe(15);
    expect(statistics.summary.canceledOrders).toBe(3);
    expect(statistics.summary.averageOrderValue).toBe(60000);
    expect(statistics.summary.newCustomers).toBe(5);

    expect(statistics.charts.revenueSeries).toHaveLength(3);
    expect(
      statistics.charts.revenueSeries.some(
        (point) => point.date === "2026-04-03",
      ),
    ).toBe(true);

    expect(statistics.charts.categoryBreakdown[0].categoryId).toBe("mon-chinh");
    expect(statistics.charts.paymentMethodBreakdown).toHaveLength(3);

    const waiterBreakdown = statistics.charts.staffBreakdown.find(
      (item) => item.role === "waiter",
    );
    expect(waiterBreakdown.count).toBe(10);
    expect(waiterBreakdown.activeCount).toBe(8);
    expect(waiterBreakdown.newInPeriod).toBe(1);
  });

  it("GET /admin/statistics returns 400 for invalid custom range", async () => {
    const response = await request(createApp()).get("/admin/statistics").query({
      period: "custom",
      from: "2026-04-10",
      to: "2026-04-01",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("STATISTICS_INVALID_DATE_RANGE");
  });

  it("GET /admin/statistics returns STATISTICS_FETCH_FAILED when aggregate throws", async () => {
    OrderMock.aggregate.mockReset();
    OrderMock.aggregate.mockRejectedValueOnce(new Error("db failed"));

    const response = await request(createApp()).get("/admin/statistics");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("STATISTICS_FETCH_FAILED");
  });
});
