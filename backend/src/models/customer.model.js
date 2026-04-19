import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema(
  {
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    promotions: {
      type: Boolean,
      default: true,
    },
    emailMarketing: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

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
      default: Date.now,
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

    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },

    passwordHash: {
      type: String,
      select: false,
    },

    lastLoginAt: {
      type: Date,
    },

    notificationSettings: {
      type: notificationSettingsSchema,
      default: () => ({}),
    },

    recentOrders: [orderSchema],
  },
  {
    timestamps: true,
  },
);

customerSchema.index({ tier: 1, isLocked: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ name: 1 });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
