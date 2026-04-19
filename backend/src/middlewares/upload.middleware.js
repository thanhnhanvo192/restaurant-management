import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads", "menus");
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

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
  const extension = path.extname(file.originalname || "").toLowerCase();
  const validMimeType = ALLOWED_MIME_TYPES.has(file.mimetype);
  const validExtension = ALLOWED_EXTENSIONS.has(extension);

  if (validMimeType && validExtension) {
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
