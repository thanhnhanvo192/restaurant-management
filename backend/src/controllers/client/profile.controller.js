import Customer from "../../models/customer.model.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { fail, ok } from "../../utils/response.js";

const buildProfile = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email || "",
  phone: customer.phone,
  avatar: customer.avatarUrl || "",
  avatarUrl: customer.avatarUrl || "",
  note: customer.note || "",
  tier: customer.tier,
  points: customer.points,
  notificationSettings: customer.notificationSettings || {},
});

export const getProfile = async (req, res) => {
  return ok(
    res,
    { profile: buildProfile(req.auth.customer) },
    "Lấy hồ sơ thành công",
  );
};

export const updateProfile = async (req, res) => {
  const { name, email, phone, avatar, avatarUrl, note } = req.body;
  const customer = await Customer.findById(req.auth.customer._id).select(
    "-passwordHash",
  );

  if (!customer) {
    return fail(res, 404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
  }

  if (name !== undefined) {
    const normalizedName = String(name).trim();
    if (!normalizedName) {
      return fail(res, 400, "Tên không được để trống", "PROFILE_INVALID_NAME");
    }
    customer.name = normalizedName;
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return fail(res, 400, "Email không hợp lệ", "PROFILE_INVALID_EMAIL");
    }

    if (normalizedEmail) {
      const emailExists = await Customer.findOne({
        email: normalizedEmail,
        _id: { $ne: customer._id },
      });
      if (emailExists) {
        return fail(res, 409, "Email đã tồn tại", "PROFILE_EMAIL_CONFLICT");
      }
    }

    customer.email = normalizedEmail || undefined;
  }

  if (phone !== undefined) {
    const normalizedPhone = String(phone).trim();
    if (!normalizedPhone) {
      return fail(
        res,
        400,
        "Số điện thoại không được để trống",
        "PROFILE_INVALID_PHONE",
      );
    }

    const phoneExists = await Customer.findOne({
      phone: normalizedPhone,
      _id: { $ne: customer._id },
    });
    if (phoneExists) {
      return fail(
        res,
        409,
        "Số điện thoại đã tồn tại",
        "PROFILE_PHONE_CONFLICT",
      );
    }

    customer.phone = normalizedPhone;
  }

  const nextAvatar = avatarUrl || avatar;
  if (nextAvatar !== undefined) {
    customer.avatarUrl = String(nextAvatar || "").trim();
  }

  if (note !== undefined) {
    customer.note = String(note || "").trim();
  }

  await customer.save();

  return ok(
    res,
    { profile: buildProfile(customer) },
    "Cập nhật hồ sơ thành công",
  );
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return fail(
      res,
      400,
      "Thiếu dữ liệu đổi mật khẩu",
      "PROFILE_PASSWORD_INVALID_PAYLOAD",
    );
  }

  if (newPassword !== confirmPassword) {
    return fail(
      res,
      400,
      "Mật khẩu xác nhận không khớp",
      "PROFILE_PASSWORD_MISMATCH",
    );
  }

  if (String(newPassword).length < 6) {
    return fail(
      res,
      400,
      "Mật khẩu mới phải có ít nhất 6 ký tự",
      "PROFILE_PASSWORD_TOO_SHORT",
    );
  }

  const customer = await Customer.findById(req.auth.customer._id).select(
    "+passwordHash",
  );

  if (!customer || !verifyPassword(currentPassword, customer.passwordHash)) {
    return fail(
      res,
      401,
      "Mật khẩu hiện tại không đúng",
      "PROFILE_PASSWORD_INVALID_CURRENT",
    );
  }

  customer.passwordHash = hashPassword(newPassword);
  await customer.save();

  return ok(res, {}, "Đổi mật khẩu thành công");
};

export const updateNotificationSettings = async (req, res) => {
  const { orderUpdates, promotions, emailMarketing } = req.body;
  const customer = await Customer.findById(req.auth.customer._id).select(
    "-passwordHash",
  );

  if (!customer) {
    return fail(res, 404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
  }

  customer.notificationSettings = {
    ...(customer.notificationSettings?.toObject
      ? customer.notificationSettings.toObject()
      : customer.notificationSettings || {}),
    ...(orderUpdates !== undefined
      ? { orderUpdates: Boolean(orderUpdates) }
      : {}),
    ...(promotions !== undefined ? { promotions: Boolean(promotions) } : {}),
    ...(emailMarketing !== undefined
      ? { emailMarketing: Boolean(emailMarketing) }
      : {}),
  };

  await customer.save();

  return ok(
    res,
    { profile: buildProfile(customer) },
    "Cập nhật cài đặt thông báo thành công",
  );
};
