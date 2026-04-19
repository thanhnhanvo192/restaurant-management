import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    customerSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    tableSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    bookingDate: {
      type: String,
      required: true,
      trim: true,
    },
    bookingTime: {
      type: String,
      required: true,
      trim: true,
    },
    guestCount: {
      type: Number,
      required: true,
      min: 1,
    },
    specialNote: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "completed"],
      default: "confirmed",
      index: true,
    },
    canceledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index(
  { tableId: 1, bookingDate: 1, bookingTime: 1 },
  { unique: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
