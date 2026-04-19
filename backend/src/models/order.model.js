import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    categoryId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const customerSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    customerSnapshot: {
      type: customerSnapshotSchema,
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    tableSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "completed", "canceled"],
      default: "pending",
      index: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewComment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentMethod: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "customerSnapshot.phone": 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
