import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const InventoryMock = {
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
};

const InventoryMovementMock = {
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

jest.unstable_mockModule("../src/models/inventory.model.js", () => ({
  default: InventoryMock,
}));

jest.unstable_mockModule("../src/models/inventory-movement.model.js", () => ({
  default: InventoryMovementMock,
}));

const { default: inventoryRoutes } =
  await import("../src/routes/admin/inventory.route.js");

const makeInventoryDoc = (overrides = {}) => {
  const doc = {
    _id: overrides._id ?? "inv-1",
    itemCode: overrides.itemCode ?? "ING-001",
    name: overrides.name ?? "Thịt bò Mỹ",
    type: overrides.type ?? "ingredient",
    unit: overrides.unit ?? "kg",
    quantityOnHand: overrides.quantityOnHand ?? 20,
    reorderLevel: overrides.reorderLevel ?? 5,
    status: overrides.status ?? "active",
    supplierName: overrides.supplierName ?? "NCC A",
    supplierContact: overrides.supplierContact ?? "0900000000",
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: overrides.updatedAt ?? new Date("2026-01-01T00:00:00.000Z"),
    save: jest.fn(async function save() {
      return this;
    }),
    toObject: jest.fn(function toObject() {
      const { toObject, save, ...plain } = this;
      return { ...plain };
    }),
  };

  return doc;
};

const makeMovementDoc = (overrides = {}) => {
  const doc = {
    _id: overrides._id ?? "mv-1",
    inventoryId: overrides.inventoryId ?? "inv-1",
    type: overrides.type ?? "stock_in",
    quantityDelta: overrides.quantityDelta ?? 5,
    quantityBefore: overrides.quantityBefore ?? 20,
    quantityAfter: overrides.quantityAfter ?? 25,
    reason: overrides.reason ?? "Nhập hàng định kỳ",
    rolledBackAt: overrides.rolledBackAt ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-01-02T00:00:00.000Z"),
    performedBy: overrides.performedBy ?? {
      id: "staff-1",
      fullName: "Quản lý kho",
      role: "inventory-manager",
    },
    save: jest.fn(async function save() {
      return this;
    }),
    toObject: jest.fn(function toObject() {
      const { toObject, save, ...plain } = this;
      return { ...plain };
    }),
  };

  return doc;
};

const createQueryChain = (results) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(results),
});

const createMovementQueryChain = (results) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(results),
});

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/admin/inventories", inventoryRoutes);
  return app;
};

describe("Inventory API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /admin/inventories returns list with meta", async () => {
    InventoryMock.countDocuments.mockResolvedValue(1);
    InventoryMock.find.mockReturnValue(createQueryChain([makeInventoryDoc()]));

    const response = await request(createApp()).get("/admin/inventories");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.inventories).toHaveLength(1);
    expect(response.body.data.inventories[0].itemCode).toBe("ING-001");
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        total: 1,
      }),
    );
  });

  it("POST /admin/inventories creates inventory item", async () => {
    InventoryMock.create.mockImplementation(async (payload) =>
      makeInventoryDoc({ _id: "inv-2", ...payload }),
    );

    const response = await request(createApp())
      .post("/admin/inventories")
      .send({
        itemCode: "ing-002",
        name: "Rau xà lách",
        type: "ingredient",
        unit: "kg",
        quantityOnHand: 10,
        reorderLevel: 3,
        status: "active",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.inventory.itemCode).toBe("ING-002");
  });

  it("PATCH /admin/inventories/:id/stock blocks negative stock", async () => {
    InventoryMock.findById.mockResolvedValue(
      makeInventoryDoc({ quantityOnHand: 2, reorderLevel: 1 }),
    );

    const response = await request(createApp())
      .patch("/admin/inventories/inv-1/stock")
      .send({
        action: "out",
        quantity: 5,
        reason: "Xuất cho bếp",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVENTORY_NEGATIVE_STOCK");
  });

  it("POST /admin/inventories/movements/:movementId/rollback rollbacks movement", async () => {
    const targetMovement = makeMovementDoc({
      _id: "mv-100",
      quantityDelta: -3,
      quantityBefore: 10,
      quantityAfter: 7,
      inventoryId: "inv-1",
      type: "stock_out",
    });

    const inventoryDoc = makeInventoryDoc({
      _id: "inv-1",
      quantityOnHand: 7,
      reorderLevel: 3,
    });

    InventoryMovementMock.findById.mockResolvedValue(targetMovement);
    InventoryMock.findById.mockResolvedValue(inventoryDoc);
    InventoryMovementMock.create.mockImplementation(async (payload) =>
      makeMovementDoc({ _id: "mv-rollback", ...payload }),
    );

    const response = await request(createApp())
      .post("/admin/inventories/movements/mv-100/rollback")
      .send({ reason: "Rollback test" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.inventory.quantityOnHand).toBe(10);
    expect(response.body.data.movement.type).toBe("rollback");
  });

  it("GET /admin/inventories/movements returns movement list", async () => {
    InventoryMovementMock.countDocuments.mockResolvedValue(1);
    InventoryMovementMock.find.mockReturnValue(
      createMovementQueryChain([makeMovementDoc()]),
    );

    const response = await request(createApp()).get(
      "/admin/inventories/movements",
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.movements).toHaveLength(1);
  });
});
