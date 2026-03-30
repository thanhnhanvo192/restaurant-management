const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Schema chi tiết cho các món ăn trong đơn hàng
const OrderItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
); // Không tạo _id riêng cho từng item trong mảng

// Schema chi tiết cho khách hàng
const CustomerSchema = new Schema(
  {
    ten: { type: String, required: true, trim: true },
    sdt: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
  },
  { _id: false },
);

// Schema chính cho Đơn hàng (Order)
const OrderSchema = new Schema(
  {
    tableLabel: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "canceled", "pending"],
      default: "pending",
    },
    customer: {
      type: CustomerSchema,
      required: true,
    },
    items: [OrderItemSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual để tính tổng tiền đơn hàng (nếu cần)
OrderSchema.virtual("totalAmount").get(function () {
  return this.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
