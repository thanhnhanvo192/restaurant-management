import Menu from "../../models/menu.model.js";
import Category from "../../models/category.model.js";
import { created, fail, ok } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const normalizeText = (value) => String(value || "").trim();

const slugify = (value) =>
  normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

const parseBoolean = (value, fallback) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return fallback;
};

const resolveCategoryId = async (rawCategoryValue) => {
  const normalized = normalizeText(rawCategoryValue);

  if (!normalized) {
    return "";
  }

  const [categoryById, categoryBySlug, categoryByName] = await Promise.all([
    Category.findById(normalized),
    Category.findOne({ slug: normalized.toLowerCase() }),
    Category.findOne({ name: new RegExp(`^${normalized}$`, "i") }),
  ]);

  const matchedCategory = categoryById || categoryBySlug || categoryByName;
  if (matchedCategory) {
    return matchedCategory.slug;
  }

  return slugify(normalized);
};

// [GET] /admin/menus
export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.find();
    return ok(res, { menus }, "Lấy danh sách món thành công");
  } catch (error) {
    logger.error("Không thể lấy danh sách món", { message: error?.message });
    return fail(res, 500, "Lỗi máy chủ", "MENU_LIST_FAILED");
  }
};

// [POST] /admin/menus
export const createMenu = async (req, res) => {
  try {
    const { name, description, price, categoryId, category } = req.body;

    const normalizedCategoryId = await resolveCategoryId(
      categoryId || category,
    );
    const normalizedImageUrl = req.file
      ? `/uploads/menus/${req.file.filename}`
      : normalizeText(req.body.imageUrl);
    const parsedPrice = Number(price);
    const parsedAvailable = parseBoolean(req.body.available, true);

    if (
      !normalizeText(name) ||
      !normalizedCategoryId ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return fail(
        res,
        400,
        "Dữ liệu món ăn không hợp lệ: cần name, price >= 0 và categoryId",
        "MENU_INVALID_PAYLOAD",
      );
    }

    const newMenu = new Menu({
      name: normalizeText(name),
      description: normalizeText(description),
      price: parsedPrice,
      categoryId: normalizedCategoryId,
      available: parsedAvailable,
      imageUrl: normalizedImageUrl,
    });

    await newMenu.save();

    return created(res, { menu: newMenu }, "Tạo món thành công");
  } catch (error) {
    logger.error("Lỗi khi tạo món", { message: error?.message });
    return fail(res, 500, "Lỗi máy chủ", "MENU_CREATE_FAILED");
  }
};

// [PUT] /admin/menus/:id
export const updateMenu = async (req, res) => {
  const { id } = req.params;

  try {
    const menu = await Menu.findById(id);
    if (!menu) {
      return fail(res, 404, "Không tìm thấy món ăn", "MENU_NOT_FOUND");
    }

    const hasNextCategory =
      req.body.categoryId !== undefined || req.body.category !== undefined;
    const nextCategoryId = hasNextCategory
      ? await resolveCategoryId(req.body.categoryId || req.body.category)
      : menu.categoryId;

    const nextName =
      req.body.name !== undefined ? normalizeText(req.body.name) : menu.name;
    const nextDescription =
      req.body.description !== undefined
        ? normalizeText(req.body.description)
        : menu.description;

    const parsedPrice =
      req.body.price !== undefined ? Number(req.body.price) : menu.price;

    if (
      !nextName ||
      !nextCategoryId ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return fail(
        res,
        400,
        "Dữ liệu món ăn không hợp lệ: cần name, price >= 0 và categoryId",
        "MENU_INVALID_PAYLOAD",
      );
    }

    const nextImageUrl = req.file
      ? `/uploads/menus/${req.file.filename}`
      : req.body.imageUrl !== undefined
        ? normalizeText(req.body.imageUrl)
        : menu.imageUrl;

    menu.name = nextName;
    menu.description = nextDescription;
    menu.price = parsedPrice;
    menu.categoryId = nextCategoryId;
    menu.imageUrl = nextImageUrl;

    if (req.body.available !== undefined) {
      menu.available = parseBoolean(req.body.available, menu.available);
    }

    await menu.save();

    return ok(res, { menu }, "Cập nhật món thành công");
  } catch (error) {
    logger.error("Lỗi khi cập nhật món", {
      message: error?.message,
      menuId: id,
    });
    return fail(res, 500, "Lỗi máy chủ", "MENU_UPDATE_FAILED");
  }
};

// [DELETE] /admin/menus/:id
export const deleteMenu = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return fail(res, 404, "Không tìm thấy món ăn", "MENU_NOT_FOUND");
    }

    return ok(res, { menu: deletedMenu }, "Xóa món thành công");
  } catch (error) {
    logger.error("Lỗi khi xóa món", {
      message: error?.message,
      menuId: id,
    });
    return fail(res, 500, "Lỗi máy chủ", "MENU_DELETE_FAILED");
  }
};
