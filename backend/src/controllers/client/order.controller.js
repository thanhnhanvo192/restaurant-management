import mongoose from "mongoose";

import Menu from "../../models/menu.model.js";
import Order from "../../models/order.model.js";
import { created, fail, ok } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const orderCode = () =>
  `OD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const isTransactionUnsupportedError = (error) => {
  const message = String(error?.message || "");
  return (
    message.includes("Transaction numbers are only allowed") ||
    message.includes("replica set member or mongos")
  );
};

const toOrderResponse = (order) => ({
  id: order._id,
  orderCode: order.orderCode,
  customerId: order.customerId,
  tableId: order.tableId || null,
  paymentMethod: order.paymentMethod,
  status: order.status,
  items: order.items,
  subtotal: order.subtotal,
  taxAmount: order.taxAmount,
  totalAmount: order.totalAmount,
  note: order.note || "",
  rating: order.rating,
  reviewComment: order.reviewComment || "",
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const normalizeItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Đơn hàng phải có ít nhất một món" };
  }

  const menuIds = items.map((item) => item.menuId).filter(Boolean);
  const menus = await Menu.find({ _id: { $in: menuIds } });
  const menuMap = new Map(menus.map((menu) => [String(menu._id), menu]));

  const normalizedItems = [];

  for (const item of items) {
    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: "Số lượng món không hợp lệ" };
    }

    const menu = item.menuId ? menuMap.get(String(item.menuId)) : null;

    if (item.menuId && !menu) {
      return { error: "Không tìm thấy món trong thực đơn" };
    }

    if (menu && !menu.available) {
      return { error: `Món ${menu.name} hiện không khả dụng` };
    }

    const unitPrice = menu ? menu.price : Number(item.unitPrice);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return { error: "Đơn giá không hợp lệ" };
    }

    normalizedItems.push({
      menuId: menu?._id,
      name: menu?.name || String(item.name || "").trim(),
      quantity,
      unitPrice,
      imageUrl: menu?.imageUrl || item.imageUrl || "",
      categoryId: menu?.categoryId || item.categoryId || "",
    });
  }

  if (normalizedItems.some((item) => !item.name)) {
    return { error: "Thiếu tên món" };
  }

  return { items: normalizedItems };
};

export const createOrder = async (req, res) => {
  const { items, tableId = null, paymentMethod = "cash", note = "" } = req.body;

  const normalizedItemsResult = await normalizeItems(items);

  if (normalizedItemsResult.error) {
    return fail(res, 400, normalizedItemsResult.error, "ORDER_INVALID_ITEMS");
  }

  if (!["cash", "card", "transfer"].includes(paymentMethod)) {
    return fail(
      res,
      400,
      "Phương thức thanh toán không hợp lệ",
      "ORDER_INVALID_PAYMENT_METHOD",
    );
  }

  const subtotal = normalizedItemsResult.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const taxAmount = 0;
  const totalAmount = subtotal + taxAmount;

  const persistOrder = async (session = null) => {
    const orderPayload = {
      orderCode: orderCode(),
      customerId: req.auth.customer._id,
      customerSnapshot: {
        name: req.auth.customer.name,
        phone: req.auth.customer.phone,
        email: req.auth.customer.email || "",
      },
      tableId: tableId || undefined,
      paymentMethod,
      status: "pending",
      items: normalizedItemsResult.items,
      subtotal,
      taxAmount,
      totalAmount,
      note,
    };

    if (session) {
      const [order] = await Order.create([orderPayload], { session });
      return order;
    }

    const [order] = await Order.create([orderPayload]);
    return order;
  };

  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const order = await persistOrder(session);

    await session.commitTransaction();

    return created(
      res,
      { order: toOrderResponse(order) },
      "Đặt món thành công",
    );
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    if (isTransactionUnsupportedError(error)) {
      try {
        const order = await persistOrder();
        return created(
          res,
          { order: toOrderResponse(order) },
          "Đặt món thành công",
        );
      } catch (fallbackError) {
        if (fallbackError?.code === 11000) {
          return fail(
            res,
            409,
            "Đơn hàng đã được tạo trước đó",
            "ORDER_CONFLICT",
          );
        }

        logger.error("Không thể tạo đơn hàng (fallback)", {
          message: fallbackError?.message,
        });
        return fail(
          res,
          500,
          fallbackError.message || "Không thể tạo đơn hàng",
          "ORDER_CREATE_FAILED",
        );
      }
    }

    if (error?.code === 11000) {
      return fail(res, 409, "Đơn hàng đã được tạo trước đó", "ORDER_CONFLICT");
    }

    logger.error("Không thể tạo đơn hàng", { message: error?.message });
    return fail(
      res,
      500,
      error.message || "Không thể tạo đơn hàng",
      "ORDER_CREATE_FAILED",
    );
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const getOrders = async (req, res) => {
  const orders = await Order.find({
    customerId: req.auth.customer._id,
  }).sort({ createdAt: -1 });

  return ok(
    res,
    { orders: orders.map(toOrderResponse) },
    "Lấy danh sách đơn hàng thành công",
  );
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({
    _id: id,
    customerId: req.auth.customer._id,
  });

  if (!order) {
    return fail(res, 404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
  }

  return ok(
    res,
    { order: toOrderResponse(order) },
    "Lấy thông tin đơn hàng thành công",
  );
};
