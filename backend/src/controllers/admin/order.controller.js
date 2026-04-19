import Order from "../../models/order.model.js";
import Customer from "../../models/customer.model.js";
import Menu from "../../models/menu.model.js";
import { created, fail, ok, sendSuccess } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "totalAmount",
  "orderCode",
  "status",
];
const ALLOWED_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
  "canceled",
];
const ALLOWED_PAYMENT_METHODS = ["cash", "card", "transfer"];

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

const parseDateBoundary = (value, isEnd = false) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (isEnd) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

const parseSort = (sortBy, sortOrder) => {
  const nextSortBy = ALLOWED_SORT_FIELDS.includes(String(sortBy))
    ? String(sortBy)
    : "createdAt";
  const direction = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
  return { [nextSortBy]: direction };
};

const orderCode = () =>
  `OD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const toOrderResponse = (order) => {
  if (!order) {
    return null;
  }

  const plainOrder =
    typeof order.toObject === "function" ? order.toObject() : { ...order };
  const orderId = plainOrder._id?.toString?.() ?? plainOrder._id ?? null;

  return {
    ...plainOrder,
    id: orderId,
    _id: orderId,
  };
};

const normalizeOrderItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Đơn hàng phải có ít nhất một món" };
  }

  const menuIds = items.map((item) => item.menuId).filter(Boolean);
  const menus = await Menu.find({ _id: { $in: menuIds } });
  const menuMap = new Map(menus.map((menu) => [String(menu._id), menu]));

  const normalizedItems = [];

  for (const item of items) {
    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: "Số lượng món phải là số nguyên dương" };
    }

    const menu = item.menuId ? menuMap.get(String(item.menuId)) : null;
    if (item.menuId && !menu) {
      return { error: "Không tìm thấy món trong thực đơn" };
    }

    const unitPrice = menu ? Number(menu.price) : Number(item.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return { error: "Đơn giá món không hợp lệ" };
    }

    const name = menu?.name || String(item.name || "").trim();
    if (!name) {
      return { error: "Tên món không được để trống" };
    }

    normalizedItems.push({
      menuId: menu?._id,
      name,
      quantity,
      unitPrice,
      imageUrl: menu?.imageUrl || item.imageUrl || "",
      categoryId: menu?.categoryId || item.categoryId || "",
    });
  }

  return { items: normalizedItems };
};

// [GET] /admin/orders
export const getOrders = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const query = {};
    const sort = parseSort(req.query.sortBy, req.query.sortOrder);

    if (req.query.status && ALLOWED_ORDER_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }

    if (
      req.query.paymentMethod &&
      ALLOWED_PAYMENT_METHODS.includes(req.query.paymentMethod)
    ) {
      query.paymentMethod = req.query.paymentMethod;
    }

    const fromDate = parseDateBoundary(req.query.from);
    const toDate = parseDateBoundary(req.query.to, true);

    if (fromDate || toDate) {
      query.createdAt = {
        ...(fromDate ? { $gte: fromDate } : {}),
        ...(toDate ? { $lte: toDate } : {}),
      };
    }

    if (req.query.keyword) {
      const keyword = String(req.query.keyword).trim();
      if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [
          { orderCode: regex },
          { "customerSnapshot.name": regex },
          { "customerSnapshot.phone": regex },
        ];
      }
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query).sort(sort).skip(skip).limit(limit),
    ]);

    const totalRevenue = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Lấy danh sách đơn hàng thành công",
      data: {
        orders: orders.map(toOrderResponse),
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        totalRevenue,
        sortBy: Object.keys(sort)[0],
        sortOrder: Object.values(sort)[0] === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    logger.error("Lỗi khi lấy danh sách đơn hàng", {
      message: error?.message,
    });
    return fail(
      res,
      500,
      "Lỗi khi lấy danh sách đơn hàng",
      "ORDER_LIST_FAILED",
    );
  }
};

// [POST] /admin/orders
export const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      paymentMethod = "cash",
      items,
      note = "",
      tableId = null,
      status = "pending",
    } = req.body;

    if (!customerId) {
      return fail(
        res,
        400,
        "Thiếu dữ liệu bắt buộc: customerId",
        "ORDER_INVALID_PAYLOAD",
      );
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return fail(
        res,
        400,
        "Phương thức thanh toán không hợp lệ",
        "ORDER_INVALID_PAYMENT_METHOD",
      );
    }

    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      return fail(
        res,
        400,
        "Trạng thái đơn hàng không hợp lệ",
        "ORDER_INVALID_STATUS",
      );
    }

    const customer =
      await Customer.findById(customerId).select("name phone email");
    if (!customer) {
      return fail(
        res,
        404,
        "Không tìm thấy khách hàng",
        "ORDER_CUSTOMER_NOT_FOUND",
      );
    }

    const normalizedItemsResult = await normalizeOrderItems(items);
    if (normalizedItemsResult.error) {
      return fail(res, 400, normalizedItemsResult.error, "ORDER_INVALID_ITEMS");
    }

    const subtotal = normalizedItemsResult.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const taxAmount = 0;
    const totalAmount = subtotal + taxAmount;

    const order = await Order.create({
      orderCode: orderCode(),
      customerId,
      customerSnapshot: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
      },
      tableId: tableId || undefined,
      paymentMethod,
      status,
      items: normalizedItemsResult.items,
      subtotal,
      taxAmount,
      totalAmount,
      note: String(note || "").trim(),
    });

    return created(
      res,
      { order: toOrderResponse(order) },
      "Tạo đơn hàng thành công",
    );
  } catch (error) {
    if (error?.code === 11000) {
      return fail(res, 409, "Đơn hàng đã tồn tại", "ORDER_CONFLICT");
    }

    logger.error("Lỗi khi tạo đơn hàng", {
      message: error?.message,
    });
    return fail(res, 500, "Lỗi khi tạo đơn hàng", "ORDER_CREATE_FAILED");
  }
};

// [PATCH] /admin/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ALLOWED_ORDER_STATUSES.includes(status)) {
    return fail(
      res,
      400,
      "Trạng thái đơn hàng không hợp lệ",
      "ORDER_INVALID_STATUS",
    );
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return fail(res, 404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
    }

    order.status = status;
    await order.save();

    return ok(
      res,
      { order: toOrderResponse(order) },
      "Cập nhật trạng thái đơn hàng thành công",
    );
  } catch (error) {
    logger.error("Lỗi khi cập nhật trạng thái đơn hàng", {
      message: error?.message,
      orderId: id,
    });
    return fail(
      res,
      500,
      "Lỗi khi cập nhật trạng thái đơn hàng",
      "ORDER_UPDATE_STATUS_FAILED",
    );
  }
};
