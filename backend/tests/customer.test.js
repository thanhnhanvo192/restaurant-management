import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const CustomerMock = {
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

jest.unstable_mockModule("../src/models/customer.model.js", () => ({
  default: CustomerMock,
}));

const {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} = await import("../src/controllers/admin/customer.controller.js");
const { updateProfile } =
  await import("../src/controllers/client/profile.controller.js");

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
      name: "Khách A",
      phone: "0909000000",
      email: "khach-a@test.dev",
      tier: "silver",
      points: 120,
      notificationSettings: {},
    },
  };

  return next();
};

const createApp = () => {
  const app = express();
  app.use(express.json());

  app.put("/customers/profile", requireAuth, updateProfile);
  app.get("/customers", getCustomers);
  app.get("/customers/:id", getCustomerById);
  app.post("/customers", createCustomer);
  app.put("/customers/:id", updateCustomer);
  app.delete("/customers/:id", deleteCustomer);

  return app;
};

const makeCustomerDoc = (overrides = {}) => ({
  _id: "customer-1",
  name: "Khách A",
  email: "khach-a@test.dev",
  phone: "0909000000",
  avatarUrl: "",
  note: "",
  tier: "silver",
  points: 120,
  notificationSettings: {},
  save: jest.fn().mockResolvedValue(true),
  select: jest.fn().mockImplementation(async function select() {
    return this;
  }),
  ...overrides,
});

const makeFindChain = (customers) => ({
  sort: jest.fn().mockResolvedValue(customers),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(customers),
});

describe("Customer API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    CustomerMock.find.mockReturnValue(makeFindChain([]));
    CustomerMock.countDocuments.mockResolvedValue(0);

    CustomerMock.findById.mockImplementation(() => makeCustomerDoc());

    CustomerMock.findOne.mockResolvedValue(null);
    CustomerMock.create.mockResolvedValue(makeCustomerDoc());
    CustomerMock.findByIdAndDelete.mockResolvedValue(makeCustomerDoc());
  });

  it("GET /customers returns 200 with list in A2 contract", async () => {
    CustomerMock.countDocuments.mockResolvedValue(1);
    CustomerMock.find.mockReturnValue(makeFindChain([makeCustomerDoc()]));

    const response = await request(createApp()).get("/customers");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customers).toHaveLength(1);
    expect(response.body.message).toBe("Lấy danh sách khách hàng thành công");
  });

  it("POST /customers creates customer", async () => {
    const createdDoc = makeCustomerDoc({
      _id: "customer-2",
      name: "Khách C",
      phone: "0988777666",
      email: "khach-c@test.dev",
    });
    CustomerMock.create.mockResolvedValue(createdDoc);

    const response = await request(createApp()).post("/customers").send({
      name: "Khách C",
      phone: "0988777666",
      email: "khach-c@test.dev",
      tier: "silver",
      points: 10,
      isLocked: false,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customer.name).toBe("Khách C");
  });

  it("PUT /customers/:id updates customer", async () => {
    const targetCustomer = makeCustomerDoc();
    CustomerMock.findById.mockResolvedValue(targetCustomer);

    const response = await request(createApp())
      .put("/customers/customer-1")
      .send({
        name: "Khách Z",
        phone: "0911999888",
        note: "Khách VIP",
        isLocked: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customer.name).toBe("Khách Z");
    expect(targetCustomer.save).toHaveBeenCalled();
  });

  it("DELETE /customers/:id deletes customer", async () => {
    CustomerMock.findByIdAndDelete.mockResolvedValue(makeCustomerDoc());

    const response = await request(createApp()).delete("/customers/customer-1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customer.id).toBe("customer-1");
  });

  it("PUT /customers/profile is protected and updates customer profile", async () => {
    const response = await request(createApp())
      .put("/customers/profile")
      .set("authorization", "Bearer test-token")
      .send({
        name: "Khách B",
        phone: "0911222333",
        email: "khach-b@test.dev",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.profile.name).toBe("Khách B");
  });

  it("PUT /customers/profile returns 409 PROFILE_EMAIL_CONFLICT when email exists", async () => {
    CustomerMock.findOne.mockResolvedValue({ _id: "another-customer" });

    const response = await request(createApp())
      .put("/customers/profile")
      .set("authorization", "Bearer test-token")
      .send({ email: "duplicate@test.dev" });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("PROFILE_EMAIL_CONFLICT");
  });
});
