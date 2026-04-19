import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const MenuModelMock = { find: jest.fn() };
const CustomerModelMock = { findById: jest.fn() };
const OrderModelMock = {
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

jest.unstable_mockModule("../src/models/menu.model.js", () => ({
  default: MenuModelMock,
}));

jest.unstable_mockModule("../src/models/customer.model.js", () => ({
  default: CustomerModelMock,
}));

jest.unstable_mockModule("../src/models/order.model.js", () => ({
  default: OrderModelMock,
}));

const { createOrder, getOrders, updateOrderStatus } =
  await import("../src/controllers/admin/order.controller.js");

const requireAuth = (req, res, next) => {
  if (req.headers.authorization !== "Bearer test-token") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      error: { code: "AUTH_UNAUTHORIZED" },
      timestamp: new Date().toISOString(),
    });
  }

  req.auth = {
    customer: {
      _id: "customer-1",
      name: "Khach test",
      phone: "0909000000",
      email: "khach@test.dev",
    },
  };

  return next();
};

const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get("/orders", getOrders);
  app.post("/orders", requireAuth, createOrder);
  app.patch("/orders/:id/status", updateOrderStatus);

  return app;
};

const makeFindChain = (orders) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(orders),
});

describe("Order API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    OrderModelMock.countDocuments.mockResolvedValue(0);
    OrderModelMock.find.mockImplementation(() => makeFindChain([]));
    CustomerModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "customer-1",
        name: "Khach test",
        phone: "0909000000",
        email: "khach@test.dev",
      }),
    });
    OrderModelMock.findById.mockResolvedValue({
      _id: "order-1",
      status: "pending",
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({ _id: "order-1", status: "completed" }),
    });
  });

  it("GET /orders returns 200 with pagination and empty list", async () => {
    OrderModelMock.countDocuments.mockResolvedValue(0);
    OrderModelMock.find.mockImplementation(() => makeFindChain([]));

    const response = await request(createApp()).get("/orders");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.orders).toEqual([]);
    expect(response.body.meta.total).toBe(0);
    expect(response.body.meta.totalPages).toBe(1);
    expect(response.body.message).toBe("Lấy danh sách đơn hàng thành công");
  });

  it("POST /orders is protected and creates order", async () => {
    MenuModelMock.find.mockResolvedValue([
      {
        _id: "menu-1",
        name: "Bún bò",
        price: 55000,
        available: true,
        categoryId: "mon-chinh",
        imageUrl: "",
      },
    ]);

    OrderModelMock.create.mockResolvedValue({
      _id: "order-1",
      orderCode: "OD-TEST-1",
      customerId: "customer-1",
      tableId: null,
      paymentMethod: "cash",
      status: "pending",
      items: [
        {
          menuId: "menu-1",
          name: "Bún bò",
          quantity: 1,
          unitPrice: 55000,
        },
      ],
      subtotal: 55000,
      taxAmount: 0,
      totalAmount: 55000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(createApp())
      .post("/orders")
      .set("authorization", "Bearer test-token")
      .send({
        customerId: "customer-1",
        items: [{ menuId: "menu-1", quantity: 1 }],
        paymentMethod: "cash",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.order.orderCode).toBe("OD-TEST-1");
  });

  it("POST /orders returns 409 ORDER_CONFLICT when duplicate order code occurs", async () => {
    MenuModelMock.find.mockResolvedValue([
      {
        _id: "menu-1",
        name: "Bún bò",
        price: 55000,
        available: true,
        categoryId: "mon-chinh",
        imageUrl: "",
      },
    ]);

    OrderModelMock.create.mockRejectedValue({ code: 11000 });

    const response = await request(createApp())
      .post("/orders")
      .set("authorization", "Bearer test-token")
      .send({
        customerId: "customer-1",
        items: [{ menuId: "menu-1", quantity: 1 }],
        paymentMethod: "cash",
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("ORDER_CONFLICT");
  });

  it("PATCH /orders/:id/status updates status successfully", async () => {
    const orderDoc = {
      _id: "order-1",
      status: "pending",
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({ _id: "order-1", status: "completed" }),
    };
    OrderModelMock.findById.mockResolvedValue(orderDoc);

    const response = await request(createApp())
      .patch("/orders/order-1/status")
      .send({ status: "completed" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.order.status).toBe("completed");
    expect(orderDoc.save).toHaveBeenCalled();
  });
});
