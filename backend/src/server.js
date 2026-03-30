import express from "express";
import adminRoutes from "./routes/admin/index.route.js";
import dotenv from "dotenv";
import { connectDB } from "./configs/database.js";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();

// Tăng giới hạn payload để nhận dữ liệu ảnh base64 từ frontend khi tạo món ăn.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
adminRoutes(app);

app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant Management System API!");
});

// Bắt lỗi payload vượt giới hạn để trả response dễ hiểu cho frontend.
app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      message: "Dữ liệu gửi lên quá lớn. Vui lòng dùng ảnh nhỏ hơn.",
    });
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "Ảnh vượt quá dung lượng cho phép (tối đa 5MB).",
    });
  }

  if (error?.message === "Chỉ chấp nhận file ảnh") {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
