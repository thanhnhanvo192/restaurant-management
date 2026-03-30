import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads", "menus");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

    cb(null, `${Date.now()}-${baseName || "menu"}${extension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Chỉ chấp nhận file ảnh"));
};

export const uploadMenuImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");
