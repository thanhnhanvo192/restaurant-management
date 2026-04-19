import AuthSession from "../models/auth-session.model.js";
import Customer from "../models/customer.model.js";
import Staff from "../models/staff.model.js";
import { hashToken, parseBearerToken } from "../utils/token.js";
import { fail } from "../utils/response.js";

const unauthorized = (res, message = "Unauthorized") =>
  fail(res, 401, message, "AUTH_UNAUTHORIZED");

export const requireCustomerAuth = async (req, res, next) => {
  const token = parseBearerToken(req.headers.authorization || "");

  if (!token) {
    return unauthorized(res, "Thiếu access token");
  }

  const session = await AuthSession.findOne({
    actorType: "customer",
    accessTokenHash: hashToken(token),
    revokedAt: null,
    accessTokenExpiresAt: { $gt: new Date() },
  });

  if (!session) {
    return unauthorized(res, "Access token không hợp lệ hoặc đã hết hạn");
  }

  const customer = await Customer.findById(session.customerId).select(
    "-passwordHash",
  );

  if (!customer) {
    return unauthorized(res, "Không tìm thấy khách hàng");
  }

  session.lastUsedAt = new Date();
  await session.save();

  req.auth = {
    customer,
    session,
    accessToken: token,
  };

  return next();
};

export const requireAdminAuth = async (req, res, next) => {
  const token = parseBearerToken(req.headers.authorization || "");

  if (!token) {
    return unauthorized(res, "Thiếu access token");
  }

  const session = await AuthSession.findOne({
    actorType: "admin",
    accessTokenHash: hashToken(token),
    revokedAt: null,
    accessTokenExpiresAt: { $gt: new Date() },
  });

  if (!session || !session.staffId) {
    return unauthorized(res, "Access token không hợp lệ hoặc đã hết hạn");
  }

  const admin = await Staff.findById(session.staffId).select("-passwordHash");

  if (!admin) {
    return unauthorized(res, "Không tìm thấy nhân viên");
  }

  if (!admin.active) {
    return fail(
      res,
      403,
      "Tài khoản nhân viên đang bị khóa",
      "AUTH_ACCOUNT_LOCKED",
    );
  }

  session.lastUsedAt = new Date();
  await session.save();

  req.auth = {
    admin,
    session,
    accessToken: token,
  };

  return next();
};

export const authorizeAdminRoles =
  (...roles) =>
  (req, res, next) => {
    const adminRole = req.auth?.admin?.role;

    if (!adminRole) {
      return unauthorized(res, "Không tìm thấy thông tin vai trò");
    }

    if (roles.length === 0 || roles.includes(adminRole)) {
      return next();
    }

    return fail(
      res,
      403,
      "Bạn không có quyền thực hiện thao tác này",
      "AUTH_FORBIDDEN",
      { requiredRoles: roles, currentRole: adminRole },
    );
  };

export default requireCustomerAuth;
