import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const StaffMock = {
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

jest.unstable_mockModule("../src/models/staff.model.js", () => ({
  default: StaffMock,
}));

const { default: staffRoutes } =
  await import("../src/routes/admin/staff.route.js");

const makeStaffDocument = (overrides = {}) => {
  const doc = {
    _id: overrides._id ?? "staff-1",
    fullName: overrides.fullName ?? "Nhân viên A",
    email: overrides.email ?? "staff@example.com",
    phone: overrides.phone ?? "0900000000",
    role: overrides.role ?? "waiter",
    passwordHash: overrides.passwordHash ?? "pbkdf2$1$salt$key",
    startDate: overrides.startDate ?? new Date("2025-01-01T00:00:00.000Z"),
    active: overrides.active ?? true,
  };

  doc.toObject = () => ({ ...doc });
  doc.save = jest.fn(async () => doc);

  return doc;
};

const createQueryChain = (results) => {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(results),
  };

  return chain;
};

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/admin/staffs", staffRoutes);
  return app;
};

describe("Staff API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /admin/staffs returns paginated list", async () => {
    StaffMock.countDocuments.mockResolvedValue(1);
    StaffMock.find.mockReturnValue(createQueryChain([makeStaffDocument()]));

    const response = await request(createApp()).get(
      "/admin/staffs?page=1&limit=10",
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.staffs).toHaveLength(1);
    expect(response.body.data.staffs[0].id).toBe("staff-1");
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      }),
    );
  });

  it("GET /admin/staffs/:id returns detail", async () => {
    StaffMock.findById.mockResolvedValue(makeStaffDocument());

    const response = await request(createApp()).get("/admin/staffs/staff-1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.staff.id).toBe("staff-1");
    expect(response.body.data.staff.passwordHash).toBeUndefined();
  });

  it("POST /admin/staffs creates a staff member", async () => {
    StaffMock.findOne.mockResolvedValue(null);
    StaffMock.create.mockImplementation(async (payload) =>
      makeStaffDocument({
        _id: "staff-2",
        ...payload,
      }),
    );

    const response = await request(createApp()).post("/admin/staffs").send({
      fullName: "Nhân viên B",
      email: "new.staff@example.com",
      phone: "0911111111",
      role: "waiter",
      password: "secret123",
      startDate: "2025-01-02T00:00:00.000Z",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.staff.email).toBe("new.staff@example.com");
    expect(StaffMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Nhân viên B",
        email: "new.staff@example.com",
        phone: "0911111111",
        role: "waiter",
        passwordHash: expect.stringMatching(/^pbkdf2\$/),
      }),
    );
  });

  it("POST /admin/staffs returns 409 when email already exists", async () => {
    StaffMock.findOne.mockResolvedValue(
      makeStaffDocument({ email: "dupe@example.com" }),
    );

    const response = await request(createApp()).post("/admin/staffs").send({
      fullName: "Nhân viên C",
      email: "dupe@example.com",
      phone: "0922222222",
      role: "admin",
      password: "secret123",
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("STAFF_EMAIL_EXISTS");
  });

  it("PUT /admin/staffs/:id updates a staff member", async () => {
    const staff = makeStaffDocument({ email: "old@example.com" });
    StaffMock.findById.mockResolvedValue(staff);
    StaffMock.findOne.mockResolvedValue(null);

    const response = await request(createApp())
      .put("/admin/staffs/staff-1")
      .send({
        fullName: "Nhân viên A mới",
        email: "updated@example.com",
        phone: "0999999999",
        role: "kitchen",
        password: "newsecret123",
        active: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.staff.email).toBe("updated@example.com");
    expect(staff.save).toHaveBeenCalled();
  });

  it("DELETE /admin/staffs/:id deletes a staff member", async () => {
    StaffMock.findByIdAndDelete.mockResolvedValue(makeStaffDocument());

    const response = await request(createApp()).delete("/admin/staffs/staff-1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.staff.id).toBe("staff-1");
  });

  it("returns validation errors for invalid payload", async () => {
    const response = await request(createApp()).post("/admin/staffs").send({
      fullName: "",
      email: "invalid-email",
      phone: "",
      role: "support",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("STAFF_VALIDATION_ERROR");
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "fullName" }),
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "phone" }),
        expect.objectContaining({ field: "role" }),
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });
});
