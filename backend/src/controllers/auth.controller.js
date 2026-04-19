import Customer from "../models/customer.model.js";
import Staff from "../models/staff.model.js";
import AuthSession from "../models/auth-session.model.js";
import User from "../models/user.model.js";
import { createToken, hashToken, parseBearerToken } from "../utils/token.js";
import { verifyPassword } from "../utils/password.js";
import { fail, ok } from "../utils/response.js";
import logger from "../utils/logger.js";

const buildCustomerResponse = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email || "",
  phone: customer.phone,
  tier: customer.tier,
  points: customer.points,
  joinedAt: customer.joinedAt,
  lastVisitAt: customer.lastVisitAt,
  isLocked: customer.isLocked,
  note: customer.note || "",
  avatarUrl: customer.avatarUrl || "",
  notificationSettings: customer.notificationSettings || {},
});

const buildAdminResponse = (staff) => ({
  id: staff._id,
  fullName: staff.fullName,
  email: staff.email,
  phone: staff.phone,
  role: staff.role,
  active: staff.active,
});

const normalizeLoginIdentifier = (value) => (value || "").trim().toLowerCase();

const tokenExpiry = () => {
  const now = new Date();
  return {
    now,
    accessTokenExpiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24),
    refreshTokenExpiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
  };
};

const createSessionTokens = async ({
  actorType,
  customerId,
  staffId,
  session,
}) => {
  const accessToken = createToken("acc");
  const refreshToken = createToken("ref");
  const expiry = tokenExpiry();

  const targetSession = session || new AuthSession();
  targetSession.actorType = actorType;
  targetSession.customerId = customerId || undefined;
  targetSession.staffId = staffId || undefined;
  targetSession.accessTokenHash = hashToken(accessToken);
  targetSession.refreshTokenHash = hashToken(refreshToken);
  targetSession.accessTokenExpiresAt = expiry.accessTokenExpiresAt;
  targetSession.refreshTokenExpiresAt = expiry.refreshTokenExpiresAt;
  targetSession.lastUsedAt = expiry.now;
  targetSession.revokedAt = null;

  await targetSession.save();

  return {
    accessToken,
    refreshToken,
  };
};

const findSessionByRefreshToken = (refreshToken) =>
  AuthSession.findOne({
    refreshTokenHash: hashToken(refreshToken),
    revokedAt: null,
    refreshTokenExpiresAt: { $gt: new Date() },
  });

export const login = async (req, res) => {
  const { identifier, email, password } = req.body;
  const loginValue = normalizeLoginIdentifier(identifier || email);

  if (!loginValue || !password) {
    return fail(
      res,
      400,
      "Vui lòng nhập thông tin đăng nhập",
      "AUTH_INVALID_PAYLOAD",
    );
  }

  const user = await User.findOne({
    email: loginValue,
    vaiTro: "customer",
  }).select("+matKhau");

  if (!user || !user.matKhau) {
    return fail(
      res,
      401,
      "Thông tin đăng nhập không hợp lệ",
      "AUTH_INVALID_CREDENTIALS",
    );
  }

  if (!verifyPassword(password, user.matKhau)) {
    return fail(
      res,
      401,
      "Thông tin đăng nhập không hợp lệ",
      "AUTH_INVALID_CREDENTIALS",
    );
  }

  const customer = await Customer.findOne({ email: loginValue }).select(
    "-passwordHash",
  );

  if (!customer) {
    return fail(
      res,
      403,
      "Tài khoản customer chưa được gắn hồ sơ khách hàng",
      "AUTH_CUSTOMER_NOT_FOUND",
    );
  }

  if (customer.isLocked) {
    return fail(res, 403, "Tài khoản đang bị khóa", "AUTH_ACCOUNT_LOCKED");
  }

  const { accessToken, refreshToken } = await createSessionTokens({
    actorType: "customer",
    customerId: customer._id,
  });

  customer.lastLoginAt = new Date();
  await customer.save();

  logger.info("Customer login success", { customerId: customer._id });

  return ok(
    res,
    {
      accessToken,
      refreshToken,
      customer: buildCustomerResponse(customer),
    },
    "Đăng nhập thành công",
  );
};

export const adminLogin = async (req, res) => {
  const { identifier, email, password } = req.body;
  const loginValue = normalizeLoginIdentifier(identifier || email);

  if (!loginValue || !password) {
    return fail(
      res,
      400,
      "Vui lòng nhập thông tin đăng nhập",
      "AUTH_INVALID_PAYLOAD",
    );
  }

  const user = await User.findOne({
    email: loginValue,
    vaiTro: "admin",
  }).select("+matKhau");
  const staff = await Staff.findOne({ email: loginValue });

  if (!user || !user.matKhau) {
    return fail(
      res,
      401,
      "Thông tin đăng nhập không hợp lệ",
      "AUTH_INVALID_CREDENTIALS",
    );
  }

  if (!verifyPassword(password, user.matKhau)) {
    return fail(
      res,
      401,
      "Thông tin đăng nhập không hợp lệ",
      "AUTH_INVALID_CREDENTIALS",
    );
  }

  if (!staff) {
    return fail(
      res,
      403,
      "Tài khoản đăng nhập chưa được gán nhân sự",
      "AUTH_STAFF_NOT_FOUND",
    );
  }

  if (!staff.active) {
    return fail(
      res,
      403,
      "Tài khoản nhân viên đang bị khóa",
      "AUTH_ACCOUNT_LOCKED",
    );
  }

  const { accessToken, refreshToken } = await createSessionTokens({
    actorType: "admin",
    staffId: staff._id,
  });

  logger.info("Admin login success", { staffId: staff._id, role: staff.role });

  return ok(
    res,
    {
      accessToken,
      refreshToken,
      admin: buildAdminResponse(staff),
    },
    "Đăng nhập admin thành công",
  );
};

export const me = async (req, res) => {
  return ok(
    res,
    { customer: buildCustomerResponse(req.auth.customer) },
    "Lấy thông tin tài khoản thành công",
  );
};

export const adminMe = async (req, res) => {
  return ok(
    res,
    { admin: buildAdminResponse(req.auth.admin) },
    "Lấy thông tin admin thành công",
  );
};

export const refresh = async (req, res) => {
  const bearerToken = parseBearerToken(req.headers.authorization || "");
  const refreshToken = req.body.refreshToken || bearerToken;

  if (!refreshToken) {
    return fail(res, 400, "Thiếu refresh token", "AUTH_REFRESH_TOKEN_REQUIRED");
  }

  const session = await findSessionByRefreshToken(refreshToken);

  if (!session || session.actorType !== "customer" || !session.customerId) {
    return fail(
      res,
      401,
      "Refresh token không hợp lệ hoặc đã hết hạn",
      "AUTH_REFRESH_TOKEN_INVALID",
    );
  }

  const customer = await Customer.findById(session.customerId).select(
    "-passwordHash",
  );

  if (!customer) {
    return fail(
      res,
      401,
      "Không tìm thấy khách hàng",
      "AUTH_CUSTOMER_NOT_FOUND",
    );
  }

  const { accessToken, refreshToken: nextRefreshToken } =
    await createSessionTokens({
      actorType: "customer",
      customerId: customer._id,
      session,
    });

  return ok(
    res,
    {
      accessToken,
      refreshToken: nextRefreshToken,
      customer: buildCustomerResponse(customer),
    },
    "Làm mới phiên thành công",
  );
};

export const adminRefresh = async (req, res) => {
  const bearerToken = parseBearerToken(req.headers.authorization || "");
  const refreshToken = req.body.refreshToken || bearerToken;

  if (!refreshToken) {
    return fail(res, 400, "Thiếu refresh token", "AUTH_REFRESH_TOKEN_REQUIRED");
  }

  const session = await findSessionByRefreshToken(refreshToken);

  if (!session || session.actorType !== "admin" || !session.staffId) {
    return fail(
      res,
      401,
      "Refresh token không hợp lệ hoặc đã hết hạn",
      "AUTH_REFRESH_TOKEN_INVALID",
    );
  }

  const staff = await Staff.findById(session.staffId).select("-passwordHash");

  if (!staff) {
    return fail(res, 401, "Không tìm thấy nhân viên", "AUTH_STAFF_NOT_FOUND");
  }

  if (!staff.active) {
    return fail(
      res,
      403,
      "Tài khoản nhân viên đang bị khóa",
      "AUTH_ACCOUNT_LOCKED",
    );
  }

  const { accessToken, refreshToken: nextRefreshToken } =
    await createSessionTokens({
      actorType: "admin",
      staffId: staff._id,
      session,
    });

  return ok(
    res,
    {
      accessToken,
      refreshToken: nextRefreshToken,
      admin: buildAdminResponse(staff),
    },
    "Làm mới phiên admin thành công",
  );
};

export const logout = async (req, res) => {
  const bearerToken = parseBearerToken(req.headers.authorization || "");
  const refreshToken = req.body.refreshToken;

  const query = [];
  if (bearerToken) {
    query.push({ accessTokenHash: hashToken(bearerToken) });
  }
  if (refreshToken) {
    query.push({ refreshTokenHash: hashToken(refreshToken) });
  }

  if (query.length === 0) {
    return fail(
      res,
      400,
      "Thiếu token để đăng xuất",
      "AUTH_LOGOUT_TOKEN_REQUIRED",
    );
  }

  await AuthSession.updateMany(
    {
      revokedAt: null,
      $or: query,
    },
    {
      $set: { revokedAt: new Date() },
    },
  );

  return ok(res, {}, "Đăng xuất thành công");
};

export const adminLogout = async (req, res) => logout(req, res);
