import Address from "../../models/address.model.js";
import { created, fail, ok } from "../../utils/response.js";

const toAddressResponse = (address) => ({
  id: address._id,
  name: address.name,
  detail: address.detail,
  phone: address.phone || "",
  isDefault: address.isDefault,
  type: address.type || "home",
});

const ensureSingleDefault = async (customerId, currentAddressId = null) => {
  const query = { customerId };

  if (currentAddressId) {
    query._id = { $ne: currentAddressId };
  }

  await Address.updateMany(query, { $set: { isDefault: false } });
};

export const getAddresses = async (req, res) => {
  const addresses = await Address.find({
    customerId: req.auth.customer._id,
  }).sort({ isDefault: -1, createdAt: -1 });
  return ok(
    res,
    { addresses: addresses.map(toAddressResponse) },
    "Lấy danh sách địa chỉ thành công",
  );
};

export const createAddress = async (req, res) => {
  const {
    name,
    detail,
    phone = "",
    isDefault = false,
    type = "home",
  } = req.body;

  if (!name || !detail) {
    return fail(
      res,
      400,
      "Thiếu dữ liệu bắt buộc: name, detail",
      "ADDRESS_INVALID_PAYLOAD",
    );
  }

  const address = await Address.create({
    customerId: req.auth.customer._id,
    name: String(name).trim(),
    detail: String(detail).trim(),
    phone: String(phone || "").trim(),
    isDefault: Boolean(isDefault),
    type: String(type || "home").trim(),
  });

  if (address.isDefault) {
    await ensureSingleDefault(req.auth.customer._id, address._id);
  }

  return created(
    res,
    { address: toAddressResponse(address) },
    "Thêm địa chỉ thành công",
  );
};

export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOne({
    _id: id,
    customerId: req.auth.customer._id,
  });

  if (!address) {
    return fail(res, 404, "Không tìm thấy địa chỉ", "ADDRESS_NOT_FOUND");
  }

  const { name, detail, phone, isDefault, type } = req.body;

  if (name !== undefined) {
    address.name = String(name).trim();
  }
  if (detail !== undefined) {
    address.detail = String(detail).trim();
  }
  if (phone !== undefined) {
    address.phone = String(phone || "").trim();
  }
  if (type !== undefined) {
    address.type = String(type || "home").trim();
  }
  if (isDefault !== undefined) {
    address.isDefault = Boolean(isDefault);
  }

  await address.save();

  if (address.isDefault) {
    await ensureSingleDefault(req.auth.customer._id, address._id);
  }

  return ok(
    res,
    { address: toAddressResponse(address) },
    "Cập nhật địa chỉ thành công",
  );
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOneAndDelete({
    _id: id,
    customerId: req.auth.customer._id,
  });

  if (!address) {
    return fail(res, 404, "Không tìm thấy địa chỉ", "ADDRESS_NOT_FOUND");
  }

  return ok(res, {}, "Xóa địa chỉ thành công");
};
