import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const MenuMock = jest.fn();
MenuMock.find = jest.fn();
MenuMock.findById = jest.fn();
MenuMock.findByIdAndDelete = jest.fn();

const CategoryMock = {
  findById: jest.fn(),
  findOne: jest.fn(),
};

jest.unstable_mockModule("../src/models/menu.model.js", () => ({
  default: MenuMock,
}));

jest.unstable_mockModule("../src/models/category.model.js", () => ({
  default: CategoryMock,
}));

const { createMenu, deleteMenu, getMenus, updateMenu } =
  await import("../src/controllers/admin/menu.controller.js");

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

  app.get("/menus", getMenus);
  app.post("/menus", requireAuth, createMenu);
  app.put("/menus/:id", requireAuth, updateMenu);
  app.delete("/menus/:id", requireAuth, deleteMenu);

  return app;
};

describe("Menu API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    MenuMock.mockImplementation((payload) => ({
      ...payload,
      _id: "menu-1",
      save: jest.fn().mockResolvedValue({
        ...payload,
        _id: "menu-1",
      }),
    }));

    CategoryMock.findById.mockResolvedValue(null);
    CategoryMock.findOne.mockResolvedValue(null);

    MenuMock.findById.mockResolvedValue({
      _id: "menu-1",
      name: "Phở bò",
      description: "",
      price: 65000,
      categoryId: "mon-chinh",
      available: true,
      imageUrl: "",
      save: jest.fn().mockResolvedValue(true),
    });

    MenuMock.findByIdAndDelete.mockResolvedValue({
      _id: "menu-1",
      name: "Phở bò",
      price: 65000,
      categoryId: "mon-chinh",
    });
  });

  it("GET /menus returns 200 with empty list in A2 contract", async () => {
    MenuMock.find.mockResolvedValue([]);

    const response = await request(createApp()).get("/menus");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Lấy danh sách món thành công");
    expect(response.body.data.menus).toEqual([]);
  });

  it("POST /menus is protected and creates menu", async () => {
    const response = await request(createApp())
      .post("/menus")
      .set("authorization", "Bearer test-token")
      .send({
        name: "Phở bò",
        price: 65000,
        categoryId: "mon-chinh",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.menu.name).toBe("Phở bò");
  });

  it("PUT /menus/:id updates menu", async () => {
    const menuDoc = {
      _id: "menu-1",
      name: "Phở bò",
      description: "",
      price: 65000,
      categoryId: "mon-chinh",
      available: true,
      imageUrl: "",
      save: jest.fn().mockResolvedValue(true),
    };
    MenuMock.findById.mockResolvedValue(menuDoc);

    const response = await request(createApp())
      .put("/menus/menu-1")
      .set("authorization", "Bearer test-token")
      .send({
        name: "Phở đặc biệt",
        price: 70000,
        available: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.menu.name).toBe("Phở đặc biệt");
    expect(menuDoc.save).toHaveBeenCalled();
  });

  it("DELETE /menus/:id deletes menu", async () => {
    const response = await request(createApp())
      .delete("/menus/menu-1")
      .set("authorization", "Bearer test-token");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.menu._id).toBe("menu-1");
  });

  it("POST /menus returns 400 MENU_INVALID_PAYLOAD on invalid body", async () => {
    const response = await request(createApp())
      .post("/menus")
      .set("authorization", "Bearer test-token")
      .send({ name: "", price: null, categoryId: "" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("MENU_INVALID_PAYLOAD");
  });
});
