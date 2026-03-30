import mongoose from "mongoose";

// 🔹 Sub-document: recentOrders
const orderSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { _id: false }, // không tạo _id cho sub-doc
);

// 🔹 Main schema
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "diamond"],
      default: "bronze",
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    joinedAt: {
      type: Date,
      required: true,
    },

    lastVisitAt: {
      type: Date,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    note: {
      type: String,
      trim: true,
    },

    recentOrders: [orderSchema],
  },
  {
    timestamps: true,
  },
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
