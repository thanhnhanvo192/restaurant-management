import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const OrderMock = {
  aggregate: jest.fn(),
};

const CustomerMock = {
  countDocuments: jest.fn(),
};

const TableMock = {
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

const MenuMock = {
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

jest.unstable_mockModule("../src/models/order.model.js", () => ({
  default: OrderMock,
}));

jest.unstable_mockModule("../src/models/customer.model.js", () => ({
  default: CustomerMock,
}));

jest.unstable_mockModule("../src/models/table.model.js", () => ({
  default: TableMock,
}));

jest.unstable_mockModule("../src/models/menu.model.js", () => ({
  default: MenuMock,
}));

const { getDashboardData } =
  await import("../src/controllers/admin/dashboard.controller.js");

const createApp = () => {
  const app = express();
  app.get("/admin/dashboard", getDashboardData);
  return app;
};

describe("Admin Dashboard API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    OrderMock.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    TableMock.countDocuments.mockResolvedValue(0);
    TableMock.aggregate.mockResolvedValue([]);

    CustomerMock.countDocuments.mockResolvedValue(0);

    MenuMock.countDocuments.mockResolvedValue(0);
    MenuMock.aggregate.mockResolvedValue([]);
  });

  it("GET /admin/dashboard returns zero-state payload for empty data", async () => {
    const response = await request(createApp()).get("/admin/dashboard");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Lấy dữ liệu dashboard thành công");

    const { dashboard } = response.body.data;
    expect(dashboard.summaryStats.totalRevenue).toBe(0);
    expect(dashboard.summaryStats.totalOrders).toBe(0);
    expect(dashboard.summaryStats.newCustomers).toBe(0);
    expect(dashboard.trends.dailyRevenue.length).toBeGreaterThan(0);
    expect(dashboard.trends.weeklyRevenue.length).toBe(8);
    expect(
      dashboard.trends.dailyRevenue.every((point) => point.revenue === 0),
    ).toBe(true);
  });

  it("GET /admin/dashboard aggregates real metrics and trends", async () => {
    OrderMock.aggregate.mockReset();
    OrderMock.aggregate
      .mockResolvedValueOnce([
        {
          totalOrders: 12,
          completedOrders: 9,
          totalRevenue: 840000,
        },
      ])
      .mockResolvedValueOnce([
        { date: "2026-04-18", revenue: 240000 },
        { date: "2026-04-19", revenue: 300000 },
      ])
      .mockResolvedValueOnce([{ year: 2026, week: 16, revenue: 840000 }])
      .mockResolvedValueOnce([
        { categoryId: "mon-chinh", quantity: 35, revenue: 550000 },
        { categoryId: "do-uong", quantity: 20, revenue: 290000 },
      ]);

    TableMock.countDocuments.mockResolvedValue(20);
    TableMock.aggregate.mockResolvedValue([
      { status: "available", count: 11 },
      { status: "occupied", count: 5 },
      { status: "reserved", count: 4 },
    ]);

    CustomerMock.countDocuments.mockResolvedValue(7);

    MenuMock.countDocuments.mockResolvedValue(40);
    MenuMock.aggregate.mockResolvedValue([
      { id: "menu-1", name: "Bun bo", soldCount: 150, price: 55000 },
      { id: "menu-2", name: "Com tam", soldCount: 120, price: 65000 },
    ]);

    const response = await request(createApp())
      .get("/admin/dashboard")
      .query({ period: "week" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { dashboard } = response.body.data;
    expect(dashboard.summaryStats.totalRevenue).toBe(840000);
    expect(dashboard.summaryStats.totalOrders).toBe(12);
    expect(dashboard.summaryStats.completedOrders).toBe(9);
    expect(dashboard.summaryStats.newCustomers).toBe(7);
    expect(dashboard.summaryStats.totalTables).toBe(20);
    expect(dashboard.summaryStats.availableTables).toBe(11);
    expect(dashboard.top.menus.length).toBe(2);
    expect(dashboard.top.categories.length).toBe(2);
    expect(
      dashboard.trends.dailyRevenue.some((point) => point.revenue === 300000),
    ).toBe(true);
    expect(dashboard.trends.weeklyRevenue.length).toBe(8);
  });

  it("GET /admin/dashboard returns DASHBOARD_FETCH_FAILED when aggregation throws", async () => {
    OrderMock.aggregate.mockReset();
    OrderMock.aggregate.mockRejectedValueOnce(new Error("db failed"));

    const response = await request(createApp()).get("/admin/dashboard");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("DASHBOARD_FETCH_FAILED");
  });
});
