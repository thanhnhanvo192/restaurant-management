import Staff from "../../models/staff.model.js";
import { hashPassword } from "../../utils/password.js";
import { fail, ok, created, sendSuccess } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "fullName",
  "email",
  "startDate",
];
const ALLOWED_ROLES = ["admin", "waiter", "kitchen"];

const normalizeText = (value) => String(value || "").trim();

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

const toStaffResponse = (staff) => {
  if (!staff) {
    return null;
  }

  const plainStaff =
    typeof staff.toObject === "function" ? staff.toObject() : { ...staff };
  const staffId = plainStaff._id?.toString?.() ?? plainStaff._id ?? null;
  const { passwordHash, ...safeStaff } = plainStaff;

  return {
    ...safeStaff,
    id: staffId,
    _id: staffId,
  };
};

const buildValidationDetails = (error) =>
  Object.values(error?.errors || {}).map((validationError) => ({
    field: validationError?.path,
    message: validationError?.message,
  }));

const isEmailConflict = (error) =>
  error?.code === 11000 &&
  (error?.keyPattern?.email ||
    Object.prototype.hasOwnProperty.call(error?.keyValue || {}, "email"));

const handleStaffError = (res, error, fallbackCode, fallbackMessage) => {
  if (isEmailConflict(error)) {
    return fail(
      res,
      409,
      "Email nhân viên đã tồn tại",
      "STAFF_EMAIL_EXISTS",
      error?.keyValue,
    );
  }

  if (error?.name === "CastError") {
    return fail(res, 400, "ID hoặc dữ liệu không hợp lệ", "STAFF_CAST_ERROR");
  }

  if (error?.name === "ValidationError") {
    return fail(
      res,
      400,
      "Dữ liệu nhân viên không hợp lệ",
      "STAFF_VALIDATION_ERROR",
      buildValidationDetails(error),
    );
  }

  logger.error(fallbackMessage, {
    message: error?.message,
  });

  return fail(res, 500, fallbackMessage, fallbackCode);
};

const isEmailTaken = async (email, staffId) => {
  if (!email) {
    return null;
  }

  return Staff.findOne({
    email,
    ...(staffId ? { _id: { $ne: staffId } } : {}),
  });
};

// [GET] /admin/staffs
export const getStaffs = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;
    const query = {};

    if (req.query.role && ALLOWED_ROLES.includes(String(req.query.role))) {
      query.role = String(req.query.role);
    }

    if (req.query.active !== undefined) {
      query.active = parseBoolean(req.query.active, true);
    }

    if (req.query.keyword) {
      const keyword = normalizeText(req.query.keyword);
      if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
      }
    }

    const sort = parseSort(req.query.sortBy, req.query.sortOrder);

    const [total, staffs] = await Promise.all([
      Staff.countDocuments(query),
      Staff.find(query).sort(sort).skip(skip).limit(limit),
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách nhân viên thành công",
      data: {
        staffs: staffs.map(toStaffResponse),
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
    return handleStaffError(
      res,
      error,
      "STAFF_LIST_FAILED",
      "Lỗi khi lấy danh sách nhân viên",
    );
  }
};

// [GET] /admin/staffs/:id
export const getStaffById = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await Staff.findById(id);

    if (!staff) {
      return fail(res, 404, "Không tìm thấy nhân viên", "STAFF_NOT_FOUND");
    }

    return ok(
      res,
      { staff: toStaffResponse(staff) },
      "Lấy thông tin nhân viên thành công",
    );
  } catch (error) {
    return handleStaffError(
      res,
      error,
      "STAFF_DETAIL_FAILED",
      "Lỗi khi lấy thông tin nhân viên",
    );
  }
};

// [POST] /admin/staffs
export const createStaff = async (req, res) => {
  try {
    const fullName = normalizeText(req.body.fullName);
    const email = normalizeText(req.body.email).toLowerCase();
    const phone = normalizeText(req.body.phone);
    const role = normalizeText(req.body.role);
    const password = normalizeText(req.body.password);
    const startDate = req.body.startDate
      ? new Date(req.body.startDate)
      : new Date();
    const active = parseBoolean(req.body.active, true);

    const existingStaff = await isEmailTaken(email);
    if (existingStaff) {
      return fail(
        res,
        409,
        "Email nhân viên đã tồn tại",
        "STAFF_EMAIL_EXISTS",
        { email },
      );
    }

    const staff = await Staff.create({
      fullName,
      email,
      phone,
      role,
      passwordHash: hashPassword(password),
      startDate,
      active,
    });

    return created(
      res,
      { staff: toStaffResponse(staff) },
      "Tạo nhân viên thành công",
    );
  } catch (error) {
    return handleStaffError(
      res,
      error,
      "STAFF_CREATE_FAILED",
      "Lỗi khi tạo nhân viên",
    );
  }
};

// [PUT] /admin/staffs/:id
export const updateStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await Staff.findById(id);

    if (!staff) {
      return fail(res, 404, "Không tìm thấy nhân viên", "STAFF_NOT_FOUND");
    }

    const nextFullName =
      req.body.fullName !== undefined
        ? normalizeText(req.body.fullName)
        : staff.fullName;
    const nextEmail =
      req.body.email !== undefined
        ? normalizeText(req.body.email).toLowerCase()
        : staff.email;
    const nextPhone =
      req.body.phone !== undefined
        ? normalizeText(req.body.phone)
        : staff.phone;
    const nextRole =
      req.body.role !== undefined ? normalizeText(req.body.role) : staff.role;
    const nextStartDate =
      req.body.startDate !== undefined
        ? new Date(req.body.startDate)
        : staff.startDate;
    const nextActive =
      req.body.active !== undefined
        ? parseBoolean(req.body.active, staff.active)
        : staff.active;

    if (nextEmail !== staff.email) {
      const emailOwner = await isEmailTaken(nextEmail, id);
      if (emailOwner) {
        return fail(
          res,
          409,
          "Email nhân viên đã tồn tại",
          "STAFF_EMAIL_EXISTS",
          { email: nextEmail },
        );
      }
    }

    staff.fullName = nextFullName;
    staff.email = nextEmail;
    staff.phone = nextPhone;
    staff.role = nextRole;
    staff.startDate = nextStartDate;
    staff.active = nextActive;

    if (req.body.password !== undefined && normalizeText(req.body.password)) {
      staff.passwordHash = hashPassword(normalizeText(req.body.password));
    }

    await staff.save();

    return ok(
      res,
      { staff: toStaffResponse(staff) },
      "Cập nhật nhân viên thành công",
    );
  } catch (error) {
    return handleStaffError(
      res,
      error,
      "STAFF_UPDATE_FAILED",
      "Lỗi khi cập nhật nhân viên",
    );
  }
};

// [DELETE] /admin/staffs/:id
export const deleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStaff = await Staff.findByIdAndDelete(id);

    if (!deletedStaff) {
      return fail(res, 404, "Không tìm thấy nhân viên", "STAFF_NOT_FOUND");
    }

    return ok(
      res,
      { staff: toStaffResponse(deletedStaff) },
      "Xoá nhân viên thành công",
    );
  } catch (error) {
    return handleStaffError(
      res,
      error,
      "STAFF_DELETE_FAILED",
      "Lỗi khi xoá nhân viên",
    );
  }
};
