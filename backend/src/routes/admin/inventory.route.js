import express from "express";
import { body, query, validationResult } from "express-validator";

import {
  createInventory,
  deleteInventory,
  getInventories,
  getInventoryById,
  getInventoryMovements,
  rollbackInventoryMovement,
  updateInventory,
  updateInventoryStock,
} from "../../controllers/admin/inventory.controller.js";
import { fail } from "../../utils/response.js";

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return fail(
      res,
      400,
      "Dữ liệu kho không hợp lệ",
      "INVENTORY_VALIDATION_ERROR",
      errors.array({ onlyFirstError: true }).map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    );
  }

  return next();
};

const inventoryBaseValidators = [
  body("itemCode")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 2, max: 32 })
    .withMessage("Mã hàng phải từ 2 đến 32 ký tự"),
  body("name")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Tên hàng phải từ 2 đến 120 ký tự"),
  body("type")
    .optional()
    .isIn(["ingredient", "package"])
    .withMessage("Loại hàng không hợp lệ"),
  body("unit")
    .optional()
    .isIn(["kg", "g", "l", "ml", "pcs", "pack", "bottle", "box"])
    .withMessage("Đơn vị không hợp lệ"),
  body("quantityOnHand")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tồn kho phải là số không âm"),
  body("reorderLevel")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Mức cảnh báo phải là số không âm"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "discontinued"])
    .withMessage("Trạng thái không hợp lệ"),
  body("supplierName")
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Tên nhà cung cấp tối đa 120 ký tự"),
  body("supplierContact")
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Liên hệ nhà cung cấp tối đa 120 ký tự"),
  body("expiresAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Ngày hết hạn không hợp lệ"),
  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Ghi chú tối đa 300 ký tự"),
];

const listValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên dương"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit phải nằm trong khoảng từ 1 đến 100"),
  query("status")
    .optional()
    .isIn(["active", "inactive", "discontinued"])
    .withMessage("status không hợp lệ"),
  query("type")
    .optional()
    .isIn(["ingredient", "package"])
    .withMessage("type không hợp lệ"),
  query("sortBy")
    .optional()
    .isIn([
      "createdAt",
      "updatedAt",
      "name",
      "itemCode",
      "quantityOnHand",
      "reorderLevel",
      "status",
    ])
    .withMessage("sortBy không hợp lệ"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder không hợp lệ"),
  query("lowStockOnly")
    .optional()
    .isIn(["true", "false"])
    .withMessage("lowStockOnly phải là true hoặc false"),
];

const createValidators = [
  body("itemCode").trim().notEmpty().withMessage("Mã hàng là bắt buộc"),
  body("name").trim().notEmpty().withMessage("Tên hàng là bắt buộc"),
  body("type")
    .notEmpty()
    .withMessage("Loại hàng là bắt buộc")
    .isIn(["ingredient", "package"])
    .withMessage("Loại hàng không hợp lệ"),
  body("unit")
    .notEmpty()
    .withMessage("Đơn vị là bắt buộc")
    .isIn(["kg", "g", "l", "ml", "pcs", "pack", "bottle", "box"])
    .withMessage("Đơn vị không hợp lệ"),
  body("quantityOnHand")
    .notEmpty()
    .withMessage("Tồn kho là bắt buộc")
    .isFloat({ min: 0 })
    .withMessage("Tồn kho phải là số không âm"),
  body("reorderLevel")
    .notEmpty()
    .withMessage("Mức cảnh báo là bắt buộc")
    .isFloat({ min: 0 })
    .withMessage("Mức cảnh báo phải là số không âm"),
  ...inventoryBaseValidators,
];

const updateValidators = [
  ...inventoryBaseValidators,
  body().custom((payload) => {
    const allowed = [
      "itemCode",
      "name",
      "type",
      "unit",
      "quantityOnHand",
      "reorderLevel",
      "status",
      "supplierName",
      "supplierContact",
      "expiresAt",
      "note",
    ];

    const hasAtLeastOneField = Object.keys(payload || {}).some((key) =>
      allowed.includes(key),
    );

    if (!hasAtLeastOneField) {
      throw new Error("Cần ít nhất một trường để cập nhật");
    }

    return true;
  }),
];

const stockValidators = [
  body("action")
    .notEmpty()
    .withMessage("action là bắt buộc")
    .isIn(["in", "out", "adjust"])
    .withMessage("action không hợp lệ"),
  body("quantity")
    .notEmpty()
    .withMessage("quantity là bắt buộc")
    .isFloat({ min: 0.000001 })
    .withMessage("quantity phải là số dương"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("reason là bắt buộc")
    .isLength({ min: 3, max: 200 })
    .withMessage("reason phải từ 3 đến 200 ký tự"),
  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("note tối đa 300 ký tự"),
  body("referenceType")
    .optional()
    .isIn(["manual", "order", "rollback", "restock"])
    .withMessage("referenceType không hợp lệ"),
  body("referenceId")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("referenceId tối đa 100 ký tự"),
];

const movementListValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên dương"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit phải nằm trong khoảng từ 1 đến 100"),
  query("type")
    .optional()
    .isIn([
      "stock_in",
      "stock_out",
      "adjustment",
      "rollback",
      "order_deduction",
      "order_restore",
    ])
    .withMessage("type không hợp lệ"),
  query("inventoryId")
    .optional()
    .isMongoId()
    .withMessage("inventoryId không hợp lệ"),
];

const rollbackValidators = [
  body("reason")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("reason phải từ 3 đến 200 ký tự"),
];

router.get("/", listValidators, validateRequest, getInventories);
router.get(
  "/movements",
  movementListValidators,
  validateRequest,
  getInventoryMovements,
);
router.get("/:id", getInventoryById);
router.post("/", createValidators, validateRequest, createInventory);
router.put("/:id", updateValidators, validateRequest, updateInventory);
router.patch(
  "/:id/stock",
  stockValidators,
  validateRequest,
  updateInventoryStock,
);
router.post(
  "/movements/:movementId/rollback",
  rollbackValidators,
  validateRequest,
  rollbackInventoryMovement,
);
router.delete("/:id", deleteInventory);

export default router;
