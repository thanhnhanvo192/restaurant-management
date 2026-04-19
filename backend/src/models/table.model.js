import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "cleaning"],
      default: "available",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

tableSchema.index({ tableNumber: 1 }, { unique: true });
tableSchema.index({ status: 1, createdAt: -1 });
tableSchema.index({ area: 1, status: 1 });
tableSchema.index({ createdAt: -1 });

const Table = mongoose.model("Table", tableSchema);
export default Table;
