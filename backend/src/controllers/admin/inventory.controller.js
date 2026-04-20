import Inventory from "../../models/inventory.model.js";
import InventoryMovement from "../../models/inventory-movement.model.js";
import { created, fail, ok, sendSuccess } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "itemCode",
  "quantityOnHand",
  "reorderLevel",
  "status",
];
const ALLOWED_FILTER_STATUSES = ["active", "inactive", "discontinued"];
const ALLOWED_FILTER_TYPES = ["ingredient", "package"];
const ALLOWED_STOCK_ACTIONS = ["in", "out", "adjust"];

const parsePage = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
};

const parseLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
};

const parseSort = (sortBy, sortOrder) => {
  const nextSortBy = ALLOWED_SORT_FIELDS.includes(String(sortBy))
    ? String(sortBy)
    : "createdAt";
  const direction = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

  return {
    [nextSortBy]: direction,
  };
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return null;
};

const normalizeText = (value) => String(value || "").trim();

const toInventoryResponse = (inventory) => {
  if (!inventory) {
    return null;
  }

  const plainInventory =
    typeof inventory.toObject === "function"
      ? inventory.toObject()
      : { ...inventory };
  const inventoryId =
    plainInventory._id?.toString?.() ?? plainInventory._id ?? null;

  return {
    ...plainInventory,
    id: inventoryId,
    _id: inventoryId,
    isLowStock:
      Number(plainInventory.quantityOnHand || 0) <=
      Number(plainInventory.reorderLevel || 0),
  };
};

const toMovementResponse = (movement) => {
  if (!movement) {
    return null;
  }

  const plainMovement =
    typeof movement.toObject === "function" ? movement.toObject() : movement;
  const movementId = plainMovement._id?.toString?.() ?? plainMovement._id;
  const inventoryId =
    plainMovement.inventoryId?._id?.toString?.() ??
    plainMovement.inventoryId?.toString?.() ??
    plainMovement.inventoryId;

  return {
    ...plainMovement,
    id: movementId,
    _id: movementId,
    inventoryId,
    inventory: plainMovement.inventoryId?._id
      ? toInventoryResponse(plainMovement.inventoryId)
      : undefined,
    rollbackFromMovementId:
      plainMovement.rollbackFromMovementId?._id?.toString?.() ??
      plainMovement.rollbackFromMovementId?.toString?.() ??
      plainMovement.rollbackFromMovementId ??
      null,
  };
};

const buildValidationDetails = (error) =>
  Object.values(error?.errors || {}).map((validationError) => ({
    field: validationError?.path,
    message: validationError?.message,
  }));

const isItemCodeConflict = (error) =>
  error?.code === 11000 &&
  (error?.keyPattern?.itemCode ||
    Object.prototype.hasOwnProperty.call(error?.keyValue || {}, "itemCode"));

const handleInventoryError = (res, error, fallbackCode, fallbackMessage) => {
  if (isItemCodeConflict(error)) {
    return fail(
      res,
      409,
      "Mã hàng đã tồn tại",
      "INVENTORY_ITEM_CODE_EXISTS",
      error?.keyValue,
    );
  }

  if (error?.name === "CastError") {
    return fail(
      res,
      400,
      "ID hoặc dữ liệu không hợp lệ",
      "INVENTORY_CAST_ERROR",
    );
  }

  if (error?.name === "ValidationError") {
    return fail(
      res,
      400,
      "Dữ liệu kho không hợp lệ",
      "INVENTORY_VALIDATION_ERROR",
      buildValidationDetails(error),
    );
  }

  logger.error(fallbackMessage, {
    message: error?.message,
  });

  return fail(res, 500, fallbackMessage, fallbackCode);
};

const buildActorFromRequest = (req) => ({
  id: req.auth?.admin?._id?.toString?.() || "",
  fullName: req.auth?.admin?.fullName || "",
  role: req.auth?.admin?.role || "",
});

// [GET] /admin/inventories
export const getInventories = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;
    const sort = parseSort(req.query.sortBy, req.query.sortOrder);

    const query = {};

    if (
      req.query.status &&
      ALLOWED_FILTER_STATUSES.includes(String(req.query.status))
    ) {
      query.status = String(req.query.status);
    }

    if (
      req.query.type &&
      ALLOWED_FILTER_TYPES.includes(String(req.query.type))
    ) {
      query.type = String(req.query.type);
    }

    if (req.query.keyword) {
      const keyword = normalizeText(req.query.keyword);
      if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [
          { name: regex },
          { itemCode: regex },
          { supplierName: regex },
        ];
      }
    }

    const lowStockOnly = parseBoolean(req.query.lowStockOnly);
    if (lowStockOnly === true) {
      query.$expr = { $lte: ["$quantityOnHand", "$reorderLevel"] };
    }

    const [total, inventories] = await Promise.all([
      Inventory.countDocuments(query),
      Inventory.find(query).sort(sort).skip(skip).limit(limit),
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách kho thành công",
      data: {
        inventories: inventories.map(toInventoryResponse),
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        sortBy: Object.keys(sort)[0],
        sortOrder: Object.values(sort)[0] === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_LIST_FAILED",
      "Lỗi khi lấy danh sách kho",
    );
  }
};

// [GET] /admin/inventories/:id
export const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return fail(
        res,
        404,
        "Không tìm thấy mặt hàng kho",
        "INVENTORY_NOT_FOUND",
      );
    }

    return ok(
      res,
      { inventory: toInventoryResponse(inventory) },
      "Lấy chi tiết kho thành công",
    );
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_DETAIL_FAILED",
      "Lỗi khi lấy chi tiết kho",
    );
  }
};

// [POST] /admin/inventories
export const createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create({
      itemCode: normalizeText(req.body.itemCode).toUpperCase(),
      name: normalizeText(req.body.name),
      type: req.body.type,
      unit: req.body.unit,
      quantityOnHand: Number(req.body.quantityOnHand),
      reorderLevel: Number(req.body.reorderLevel),
      status: req.body.status || "active",
      supplierName: normalizeText(req.body.supplierName),
      supplierContact: normalizeText(req.body.supplierContact),
      expiresAt: req.body.expiresAt || null,
      note: normalizeText(req.body.note),
    });

    return created(
      res,
      { inventory: toInventoryResponse(inventory) },
      "Tạo mặt hàng kho thành công",
    );
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_CREATE_FAILED",
      "Lỗi khi tạo mặt hàng kho",
    );
  }
};

// [PUT] /admin/inventories/:id
export const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return fail(
        res,
        404,
        "Không tìm thấy mặt hàng kho",
        "INVENTORY_NOT_FOUND",
      );
    }

    if (req.body.itemCode !== undefined) {
      inventory.itemCode = normalizeText(req.body.itemCode).toUpperCase();
    }
    if (req.body.name !== undefined) {
      inventory.name = normalizeText(req.body.name);
    }
    if (req.body.type !== undefined) {
      inventory.type = req.body.type;
    }
    if (req.body.unit !== undefined) {
      inventory.unit = req.body.unit;
    }
    if (req.body.quantityOnHand !== undefined) {
      inventory.quantityOnHand = Number(req.body.quantityOnHand);
    }
    if (req.body.reorderLevel !== undefined) {
      inventory.reorderLevel = Number(req.body.reorderLevel);
    }
    if (req.body.status !== undefined) {
      inventory.status = req.body.status;
    }
    if (req.body.supplierName !== undefined) {
      inventory.supplierName = normalizeText(req.body.supplierName);
    }
    if (req.body.supplierContact !== undefined) {
      inventory.supplierContact = normalizeText(req.body.supplierContact);
    }
    if (req.body.expiresAt !== undefined) {
      inventory.expiresAt = req.body.expiresAt || null;
    }
    if (req.body.note !== undefined) {
      inventory.note = normalizeText(req.body.note);
    }

    await inventory.save();

    return ok(
      res,
      { inventory: toInventoryResponse(inventory) },
      "Cập nhật mặt hàng kho thành công",
    );
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_UPDATE_FAILED",
      "Lỗi khi cập nhật mặt hàng kho",
    );
  }
};

// [DELETE] /admin/inventories/:id
export const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return fail(
        res,
        404,
        "Không tìm thấy mặt hàng kho",
        "INVENTORY_NOT_FOUND",
      );
    }

    await Inventory.deleteOne({ _id: inventory._id });

    return ok(res, {}, "Xóa mặt hàng kho thành công");
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_DELETE_FAILED",
      "Lỗi khi xóa mặt hàng kho",
    );
  }
};

// [PATCH] /admin/inventories/:id/stock
export const updateInventoryStock = async (req, res) => {
  const { id } = req.params;
  const action = String(req.body.action || "").trim();
  const quantity = Number(req.body.quantity);
  const reason = normalizeText(req.body.reason);
  const note = normalizeText(req.body.note);
  const referenceType = normalizeText(req.body.referenceType) || "manual";
  const referenceId = normalizeText(req.body.referenceId);

  if (!ALLOWED_STOCK_ACTIONS.includes(action)) {
    return fail(
      res,
      400,
      "Hành động tồn kho không hợp lệ",
      "INVENTORY_INVALID_STOCK_ACTION",
    );
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return fail(
      res,
      400,
      "Số lượng phải là số dương",
      "INVENTORY_INVALID_STOCK_QUANTITY",
    );
  }

  if (!reason) {
    return fail(
      res,
      400,
      "Lý do điều chỉnh kho là bắt buộc",
      "INVENTORY_STOCK_REASON_REQUIRED",
    );
  }

  try {
    const inventory = await Inventory.findById(id);

    if (!inventory) {
      return fail(
        res,
        404,
        "Không tìm thấy mặt hàng kho",
        "INVENTORY_NOT_FOUND",
      );
    }

    const quantityDelta = action === "out" ? -quantity : quantity;
    const movementType =
      action === "in"
        ? "stock_in"
        : action === "out"
          ? "stock_out"
          : "adjustment";

    const quantityBefore = Number(inventory.quantityOnHand || 0);
    const quantityAfter =
      action === "adjust" ? quantity : quantityBefore + quantityDelta;

    if (quantityAfter < 0) {
      return fail(
        res,
        400,
        "Số lượng tồn kho không được âm",
        "INVENTORY_NEGATIVE_STOCK",
      );
    }

    const finalDelta =
      action === "adjust" ? quantityAfter - quantityBefore : quantityDelta;

    inventory.quantityOnHand = quantityAfter;
    await inventory.save();

    const movement = await InventoryMovement.create({
      inventoryId: inventory._id,
      type: movementType,
      quantityDelta: finalDelta,
      quantityBefore,
      quantityAfter,
      reason,
      note,
      referenceType,
      referenceId,
      performedBy: buildActorFromRequest(req),
    });

    return ok(
      res,
      {
        inventory: toInventoryResponse(inventory),
        movement: toMovementResponse(movement),
      },
      "Cập nhật tồn kho thành công",
    );
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_STOCK_UPDATE_FAILED",
      "Lỗi khi cập nhật tồn kho",
    );
  }
};

// [GET] /admin/inventories/movements
export const getInventoryMovements = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.inventoryId) {
      query.inventoryId = req.query.inventoryId;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const [total, movements] = await Promise.all([
      InventoryMovement.countDocuments(query),
      InventoryMovement.find(query)
        .populate("inventoryId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy lịch sử biến động kho thành công",
      data: {
        movements: movements.map(toMovementResponse),
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_MOVEMENT_LIST_FAILED",
      "Lỗi khi lấy lịch sử biến động kho",
    );
  }
};

// [POST] /admin/inventories/movements/:movementId/rollback
export const rollbackInventoryMovement = async (req, res) => {
  const { movementId } = req.params;
  const rollbackReason =
    normalizeText(req.body.reason) || "Rollback giao dịch kho";

  try {
    const targetMovement = await InventoryMovement.findById(movementId);

    if (!targetMovement) {
      return fail(
        res,
        404,
        "Không tìm thấy giao dịch kho",
        "INVENTORY_MOVEMENT_NOT_FOUND",
      );
    }

    if (targetMovement.type === "rollback") {
      return fail(
        res,
        400,
        "Không thể rollback giao dịch rollback",
        "INVENTORY_ROLLBACK_INVALID_TARGET",
      );
    }

    if (targetMovement.rolledBackAt) {
      return fail(
        res,
        400,
        "Giao dịch đã được rollback trước đó",
        "INVENTORY_ROLLBACK_ALREADY_DONE",
      );
    }

    const inventory = await Inventory.findById(targetMovement.inventoryId);
    if (!inventory) {
      return fail(
        res,
        404,
        "Không tìm thấy mặt hàng kho",
        "INVENTORY_NOT_FOUND",
      );
    }

    const rollbackDelta = -Number(targetMovement.quantityDelta || 0);
    const quantityBefore = Number(inventory.quantityOnHand || 0);
    const quantityAfter = quantityBefore + rollbackDelta;

    if (quantityAfter < 0) {
      return fail(
        res,
        400,
        "Không thể rollback vì sẽ làm tồn kho âm",
        "INVENTORY_ROLLBACK_NEGATIVE_STOCK",
      );
    }

    inventory.quantityOnHand = quantityAfter;
    await inventory.save();

    const rollbackMovement = await InventoryMovement.create({
      inventoryId: inventory._id,
      type: "rollback",
      quantityDelta: rollbackDelta,
      quantityBefore,
      quantityAfter,
      reason: rollbackReason,
      note: `Rollback movement ${targetMovement._id}`,
      referenceType: "rollback",
      referenceId: String(targetMovement._id),
      performedBy: buildActorFromRequest(req),
      rollbackFromMovementId: targetMovement._id,
    });

    targetMovement.rolledBackAt = new Date();
    await targetMovement.save();

    return ok(
      res,
      {
        inventory: toInventoryResponse(inventory),
        movement: toMovementResponse(rollbackMovement),
      },
      "Rollback giao dịch kho thành công",
    );
  } catch (error) {
    return handleInventoryError(
      res,
      error,
      "INVENTORY_ROLLBACK_FAILED",
      "Lỗi khi rollback giao dịch kho",
    );
  }
};
