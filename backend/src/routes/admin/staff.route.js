import express from "express";
import { body, query, validationResult } from "express-validator";

const router = express.Router();

import {
  createStaff,
  deleteStaff,
  getStaffById,
  getStaffs,
  updateStaff,
} from "../../controllers/admin/staff.controller.js";
import { fail } from "../../utils/response.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return fail(
      res,
      400,
      "Dữ liệu nhân viên không hợp lệ",
      "STAFF_VALIDATION_ERROR",
      errors.array({ onlyFirstError: true }).map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    );
  }

  return next();
};

const listValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên dương"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit phải nằm trong khoảng từ 1 đến 100"),
];

const createValidators = [
  body("fullName").trim().notEmpty().withMessage("Họ tên là bắt buộc"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Số điện thoại là bắt buộc"),
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Vai trò là bắt buộc")
    .isIn(["admin", "waiter", "kitchen", "inventory-manager"])
    .withMessage("Vai trò không hợp lệ"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate không hợp lệ"),
  body("active")
    .optional()
    .isBoolean()
    .withMessage("active phải là giá trị boolean"),
];

const updateValidators = [
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Họ tên không được để trống"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Số điện thoại không được để trống"),
  body("role")
    .optional()
    .trim()
    .isIn(["admin", "waiter", "kitchen", "inventory-manager"])
    .withMessage("Vai trò không hợp lệ"),
  body("password")
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate không hợp lệ"),
  body("active")
    .optional()
    .isBoolean()
    .withMessage("active phải là giá trị boolean"),
];

router.get("/", listValidators, validateRequest, getStaffs);
router.get("/:id", getStaffById);
router.post("/", createValidators, validateRequest, createStaff);
router.put("/:id", updateValidators, validateRequest, updateStaff);
router.delete("/:id", deleteStaff);

export default router;
