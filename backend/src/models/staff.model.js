import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // validate email
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "waiter", "kitchen"],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

staffSchema.index({ role: 1, active: 1 });
staffSchema.index({ createdAt: -1 });
staffSchema.index({ fullName: 1 });

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
