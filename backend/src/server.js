import express from "express";
import adminRoutes from "./routes/admin/index.route.js";
import clientRoutes from "./routes/client/index.route.js";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./configs/database.js";
import { env } from "./configs/env.js";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { fail, ok } from "./utils/response.js";
import logger from "./utils/logger.js";
import {
  rateLimitBaseline,
  requestMetricsLogger,
  sanitizeInput,
} from "./middlewares/security.middleware.js";

const app = express();

// Tăng giới hạn payload để nhận dữ liệu ảnh base64 từ frontend khi tạo món ăn.
app.use(express.json({ limit: env.apiPayloadLimit }));
app.use(express.urlencoded({ limit: env.apiPayloadLimit, extended: true }));
app.use(sanitizeInput);
app.use(rateLimitBaseline);
app.use(requestMetricsLogger);
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
adminRoutes(app);
clientRoutes(app);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  return ok(res, {}, "Welcome to the Restaurant Management System API!");
});

app.get("/health", (_req, res) => {
  const state = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbStatus = dbStatusMap[state] || "unknown";
  const isHealthy = dbStatus === "connected" || env.nodeEnv === "test";

  return ok(
    res,
    {
      status: isHealthy ? "ok" : "degraded",
      uptimeSeconds: Number(process.uptime().toFixed(0)),
      nodeEnv: env.nodeEnv,
      database: {
        status: dbStatus,
        readyState: state,
      },
    },
    "Health check thành công",
  );
});

// Bắt lỗi payload vượt giới hạn để trả response dễ hiểu cho frontend.
app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") {
    return fail(
      res,
      413,
      "Dữ liệu gửi lên quá lớn. Vui lòng dùng ảnh nhỏ hơn.",
      "PAYLOAD_TOO_LARGE",
    );
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return fail(
      res,
      413,
      "Ảnh vượt quá dung lượng cho phép (tối đa 5MB).",
      "FILE_TOO_LARGE",
    );
  }

  if (error?.message === "Chỉ chấp nhận file ảnh") {
    return fail(res, 400, error.message, "INVALID_FILE_TYPE");
  }

  if (error?.name === "ValidationError") {
    return fail(res, 400, error.message, "VALIDATION_ERROR");
  }

  if (error?.name === "CastError") {
    return fail(res, 400, "ID hoặc dữ liệu không hợp lệ", "CAST_ERROR");
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0];
    return fail(
      res,
      409,
      duplicateField ? `${duplicateField} đã tồn tại` : "Dữ liệu đã tồn tại",
      "DUPLICATE_KEY",
      error.keyValue,
    );
  }

  logger.error("Unhandled server error", {
    message: error?.message,
    stack: error?.stack,
  });

  return fail(res, 500, "Lỗi máy chủ", "INTERNAL_SERVER_ERROR");
});

const PORT = env.port;

export { app };

if (env.nodeEnv !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      logger.info("Server started", { port: PORT, nodeEnv: env.nodeEnv });
    });
  });
}
