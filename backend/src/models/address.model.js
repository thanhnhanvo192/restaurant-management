import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      trim: true,
      default: "home",
    },
  },
  {
    timestamps: true,
  },
);

addressSchema.index({ customerId: 1, isDefault: 1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;
