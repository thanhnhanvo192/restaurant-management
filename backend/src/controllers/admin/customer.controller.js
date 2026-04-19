import Customer from "../../models/customer.model.js";
import { created, fail, ok, sendSuccess } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLOWED_TIERS = ["bronze", "silver", "gold", "diamond"];
const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "email",
  "phone",
  "points",
];

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
  return { [nextSortBy]: direction };
};

const toCustomerResponse = (customer) => {
  if (!customer) {
    return null;
  }

  const plainCustomer =
    typeof customer.toObject === "function"
      ? customer.toObject()
      : { ...customer };

  const customerId =
    plainCustomer._id?.toString?.() ?? plainCustomer._id ?? null;
  const { passwordHash, ...safeCustomer } = plainCustomer;

  return {
    ...safeCustomer,
    id: customerId,
    _id: customerId,
  };
};

const buildValidationDetails = (error) =>
  Object.values(error?.errors || {}).map((validationError) => ({
    field: validationError?.path,
    message: validationError?.message,
  }));

const isDuplicateFieldError = (error, fieldName) =>
  error?.code === 11000 &&
  (error?.keyPattern?.[fieldName] ||
    Object.prototype.hasOwnProperty.call(error?.keyValue || {}, fieldName));

const handleCustomerError = (res, error, fallbackCode, fallbackMessage) => {
  if (isDuplicateFieldError(error, "phone")) {
    return fail(
      res,
      409,
      "Số điện thoại khách hàng đã tồn tại",
      "CUSTOMER_PHONE_EXISTS",
      error?.keyValue,
    );
  }

  if (isDuplicateFieldError(error, "email")) {
    return fail(
      res,
      409,
      "Email khách hàng đã tồn tại",
      "CUSTOMER_EMAIL_EXISTS",
      error?.keyValue,
    );
  }

  if (error?.name === "CastError") {
    return fail(
      res,
      400,
      "ID hoặc dữ liệu khách hàng không hợp lệ",
      "CUSTOMER_CAST_ERROR",
    );
  }

  if (error?.name === "ValidationError") {
    return fail(
      res,
      400,
      "Dữ liệu khách hàng không hợp lệ",
      "CUSTOMER_VALIDATION_ERROR",
      buildValidationDetails(error),
    );
  }

  logger.error(fallbackMessage, {
    message: error?.message,
  });

  return fail(res, 500, fallbackMessage, fallbackCode);
};

const isEmailTaken = async (email, customerId) => {
  if (!email) {
    return null;
  }

  return Customer.findOne({
    email,
    ...(customerId ? { _id: { $ne: customerId } } : {}),
  });
};

const isPhoneTaken = async (phone, customerId) => {
  if (!phone) {
    return null;
  }

  return Customer.findOne({
    phone,
    ...(customerId ? { _id: { $ne: customerId } } : {}),
  });
};

//[GET] /admin /customers;
export const getCustomers = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;
    const shouldPaginate =
      req.query.page !== undefined || req.query.limit !== undefined;
    const query = {};

    if (req.query.tier && ALLOWED_TIERS.includes(String(req.query.tier))) {
      query.tier = String(req.query.tier);
    }

    if (req.query.isLocked !== undefined) {
      query.isLocked = parseBoolean(req.query.isLocked, false);
    }

    if (req.query.keyword) {
      const keyword = normalizeText(req.query.keyword);
      if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
      }
    }

    const sort = parseSort(req.query.sortBy, req.query.sortOrder);

    const [total, customers] = await Promise.all([
      Customer.countDocuments(query),
      shouldPaginate
        ? Customer.find(query).sort(sort).skip(skip).limit(limit)
        : Customer.find(query).sort(sort),
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách khách hàng thành công",
      data: { customers: customers.map(toCustomerResponse) },
      meta: {
        page: shouldPaginate ? page : 1,
        limit: shouldPaginate ? limit : customers.length,
        total,
        totalPages: shouldPaginate ? Math.max(1, Math.ceil(total / limit)) : 1,
        sortBy: Object.keys(sort)[0],
        sortOrder: Object.values(sort)[0] === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    return handleCustomerError(
      res,
      error,
      "CUSTOMER_LIST_FAILED",
      "Lỗi khi lấy danh sách khách hàng",
    );
  }
};

// [GET] /admin/customers/:id
export const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findById(id);

    if (!customer) {
      return fail(res, 404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
    }

    return ok(
      res,
      { customer: toCustomerResponse(customer) },
      "Lấy thông tin khách hàng thành công",
    );
  } catch (error) {
    return handleCustomerError(
      res,
      error,
      "CUSTOMER_DETAIL_FAILED",
      "Lỗi khi lấy thông tin khách hàng",
    );
  }
};

// [POST] /admin/customers
export const createCustomer = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email).toLowerCase();
    const tier = normalizeText(req.body.tier || "bronze") || "bronze";
    const points = Number.isFinite(Number(req.body.points))
      ? Number(req.body.points)
      : 0;
    const isLocked = parseBoolean(req.body.isLocked, false);
    const note = normalizeText(req.body.note);
    const avatarUrl = normalizeText(req.body.avatarUrl || req.body.avatar);

    if (!name || !phone) {
      return fail(
        res,
        400,
        "Thiếu dữ liệu bắt buộc: name, phone",
        "CUSTOMER_INVALID_PAYLOAD",
      );
    }

    const [phoneOwner, emailOwner] = await Promise.all([
      isPhoneTaken(phone),
      isEmailTaken(email),
    ]);

    if (phoneOwner) {
      return fail(
        res,
        409,
        "Số điện thoại khách hàng đã tồn tại",
        "CUSTOMER_PHONE_EXISTS",
        { phone },
      );
    }

    if (email && emailOwner) {
      return fail(
        res,
        409,
        "Email khách hàng đã tồn tại",
        "CUSTOMER_EMAIL_EXISTS",
        { email },
      );
    }

    const customer = await Customer.create({
      name,
      phone,
      ...(email ? { email } : {}),
      tier,
      points,
      isLocked,
      note,
      avatarUrl,
    });

    return created(
      res,
      { customer: toCustomerResponse(customer) },
      "Tạo khách hàng thành công",
    );
  } catch (error) {
    return handleCustomerError(
      res,
      error,
      "CUSTOMER_CREATE_FAILED",
      "Lỗi khi tạo khách hàng",
    );
  }
};

// [PUT] /admin/customers/:id
export const updateCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findById(id);

    if (!customer) {
      return fail(res, 404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
    }

    const nextName =
      req.body.name !== undefined
        ? normalizeText(req.body.name)
        : customer.name;
    const nextPhone =
      req.body.phone !== undefined
        ? normalizeText(req.body.phone)
        : customer.phone;
    const nextEmail =
      req.body.email !== undefined
        ? normalizeText(req.body.email).toLowerCase()
        : customer.email || "";

    if (!nextName || !nextPhone) {
      return fail(
        res,
        400,
        "name và phone không được để trống",
        "CUSTOMER_INVALID_PAYLOAD",
      );
    }

    if (nextPhone !== customer.phone) {
      const phoneOwner = await isPhoneTaken(nextPhone, id);
      if (phoneOwner) {
        return fail(
          res,
          409,
          "Số điện thoại khách hàng đã tồn tại",
          "CUSTOMER_PHONE_EXISTS",
          { phone: nextPhone },
        );
      }
    }

    if (nextEmail !== (customer.email || "")) {
      const emailOwner = await isEmailTaken(nextEmail, id);
      if (nextEmail && emailOwner) {
        return fail(
          res,
          409,
          "Email khách hàng đã tồn tại",
          "CUSTOMER_EMAIL_EXISTS",
          { email: nextEmail },
        );
      }
    }

    customer.name = nextName;
    customer.phone = nextPhone;
    customer.email = nextEmail || undefined;

    if (req.body.tier !== undefined) {
      customer.tier = normalizeText(req.body.tier);
    }

    if (
      req.body.points !== undefined &&
      Number.isFinite(Number(req.body.points))
    ) {
      customer.points = Number(req.body.points);
    }

    if (req.body.isLocked !== undefined) {
      customer.isLocked = parseBoolean(req.body.isLocked, customer.isLocked);
    }

    if (req.body.note !== undefined) {
      customer.note = normalizeText(req.body.note);
    }

    if (req.body.avatarUrl !== undefined || req.body.avatar !== undefined) {
      customer.avatarUrl = normalizeText(req.body.avatarUrl || req.body.avatar);
    }

    await customer.save();

    return ok(
      res,
      { customer: toCustomerResponse(customer) },
      "Cập nhật khách hàng thành công",
    );
  } catch (error) {
    return handleCustomerError(
      res,
      error,
      "CUSTOMER_UPDATE_FAILED",
      "Lỗi khi cập nhật khách hàng",
    );
  }
};

// [DELETE] /admin/customers/:id
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return fail(res, 404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
    }

    return ok(
      res,
      { customer: toCustomerResponse(deletedCustomer) },
      "Xóa khách hàng thành công",
    );
  } catch (error) {
    return handleCustomerError(
      res,
      error,
      "CUSTOMER_DELETE_FAILED",
      "Lỗi khi xóa khách hàng",
    );
  }
};
