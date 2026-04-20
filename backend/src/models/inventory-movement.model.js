import mongoose from "mongoose";

const MOVEMENT_TYPES = [
  "stock_in",
  "stock_out",
  "adjustment",
  "rollback",
  "order_deduction",
  "order_restore",
];
const MOVEMENT_REFERENCE_TYPES = ["manual", "order", "rollback", "restock"];

const inventoryMovementSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: MOVEMENT_TYPES,
      index: true,
    },
    quantityDelta: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => Number.isFinite(value) && value !== 0,
        message: "quantityDelta must be a non-zero finite number",
      },
    },
    quantityBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    referenceType: {
      type: String,
      enum: MOVEMENT_REFERENCE_TYPES,
      default: "manual",
      index: true,
    },
    referenceId: {
      type: String,
      trim: true,
      default: "",
    },
    performedBy: {
      id: {
        type: String,
        default: "",
      },
      fullName: {
        type: String,
        default: "",
      },
      role: {
        type: String,
        default: "",
      },
    },
    rollbackFromMovementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryMovement",
      default: null,
      index: true,
    },
    rolledBackAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

inventoryMovementSchema.index({ inventoryId: 1, createdAt: -1 });
inventoryMovementSchema.index({ type: 1, createdAt: -1 });
inventoryMovementSchema.index({ referenceType: 1, referenceId: 1 });

export const INVENTORY_MOVEMENT_ENUMS = {
  MOVEMENT_TYPES,
  MOVEMENT_REFERENCE_TYPES,
};

const InventoryMovement = mongoose.model(
  "InventoryMovement",
  inventoryMovementSchema,
);

export default InventoryMovement;
