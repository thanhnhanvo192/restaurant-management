import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema(
  {
    actorType: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
      default: "customer",
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      index: true,
    },
    accessTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accessTokenExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    refreshTokenExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

authSessionSchema.index({ actorType: 1, customerId: 1 });
authSessionSchema.index({ actorType: 1, staffId: 1 });

const AuthSession = mongoose.model("AuthSession", authSessionSchema);

export default AuthSession;
