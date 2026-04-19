import dotenv from "dotenv";

dotenv.config();

const toList = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber(process.env.PORT, 5000),
  mongoUrl: process.env.MONGO_URL || "",
  corsOrigins: toList(process.env.CORS_ORIGIN, ["http://localhost:5173"]),
  apiPayloadLimit: process.env.API_PAYLOAD_LIMIT || "10mb",
};

export const validateEnv = () => {
  if (!env.mongoUrl) {
    throw new Error("Thiếu biến môi trường MONGO_URL");
  }
};
