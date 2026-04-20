import mongoose from "mongoose";

const INVENTORY_TYPES = ["ingredient", "package"];
const INVENTORY_UNITS = ["kg", "g", "l", "ml", "pcs", "pack", "bottle", "box"];
const INVENTORY_STATUSES = ["active", "inactive", "discontinued"];

const inventorySchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: INVENTORY_TYPES,
      default: "ingredient",
      index: true,
    },
    unit: {
      type: String,
      required: true,
      enum: INVENTORY_UNITS,
    },
    quantityOnHand: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: INVENTORY_STATUSES,
      default: "active",
      index: true,
    },
    supplierName: {
      type: String,
      trim: true,
      default: "",
    },
    supplierContact: {
      type: String,
      trim: true,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

inventorySchema.index({ itemCode: 1 }, { unique: true });
inventorySchema.index({ type: 1, status: 1 });
inventorySchema.index({ status: 1, updatedAt: -1 });
inventorySchema.index({ quantityOnHand: 1, reorderLevel: 1 });
inventorySchema.index({ expiresAt: 1 });

export const INVENTORY_ENUMS = {
  INVENTORY_TYPES,
  INVENTORY_UNITS,
  INVENTORY_STATUSES,
};

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
