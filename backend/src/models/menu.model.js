import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

menuSchema.index({ categoryId: 1, available: 1 });
menuSchema.index({ available: 1, createdAt: -1 });
menuSchema.index({ name: 1 });
menuSchema.index({ createdAt: -1 });

const Menu = mongoose.model("Menu", menuSchema);

export default Menu;
