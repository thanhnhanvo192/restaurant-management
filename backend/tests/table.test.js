import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const TableMock = jest.fn();
TableMock.find = jest.fn();
TableMock.countDocuments = jest.fn();
TableMock.findByIdAndUpdate = jest.fn();
TableMock.findByIdAndDelete = jest.fn();

jest.unstable_mockModule("../src/models/table.model.js", () => ({
  default: TableMock,
}));

const { getTables, createTable, updateTable, deleteTable } =
  await import("../src/controllers/admin/table.controller.js");

const requireAuth = (req, res, next) => {
  if (req.headers.authorization !== "Bearer test-token") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      error: { code: "AUTH_UNAUTHORIZED" },
      timestamp: new Date().toISOString(),
    });
  }

  req.auth = { user: { id: "admin-1" } };
  return next();
};

const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get("/tables", getTables);
  app.post("/tables", requireAuth, createTable);
  app.put("/tables/:id", requireAuth, updateTable);
  app.delete("/tables/:id", requireAuth, deleteTable);

  return app;
};

const makeFindChain = (tables) => ({
  sort: jest.fn().mockResolvedValue(tables),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(tables),
});

describe("Table API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    TableMock.mockImplementation((payload) => ({
      ...payload,
      _id: "table-1",
      save: jest.fn().mockResolvedValue({
        ...payload,
        _id: "table-1",
      }),
    }));
  });

  it("GET /tables returns 200 with empty list in A2 contract", async () => {
    TableMock.countDocuments.mockResolvedValue(0);
    TableMock.find.mockReturnValue(makeFindChain([]));

    const response = await request(createApp()).get("/tables");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Lấy danh sách bàn thành công");
    expect(response.body.data.tables).toEqual([]);
    expect(typeof response.body.timestamp).toBe("string");
  });

  it("POST /tables is protected and creates a table with contract envelope", async () => {
    const response = await request(createApp())
      .post("/tables")
      .set("authorization", "Bearer test-token")
      .send({
        tableNumber: "A01",
        area: "Tầng trệt",
        capacity: 4,
        status: "available",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Thêm bàn thành công");
    expect(response.body.data.table.tableNumber).toBe("A01");
  });

  it("PUT /tables/:id returns 404 TABLE_NOT_FOUND when target does not exist", async () => {
    TableMock.findByIdAndUpdate.mockResolvedValue(null);

    const response = await request(createApp())
      .put("/tables/missing-id")
      .set("authorization", "Bearer test-token")
      .send({
        tableNumber: "A99",
        area: "VIP",
        capacity: 10,
        status: "reserved",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("TABLE_NOT_FOUND");
    expect(response.body.message).toBe("Không tìm thấy bàn");
  });
});
