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

const Menu = mongoose.model("Menu", menuSchema);

export default Menu;
