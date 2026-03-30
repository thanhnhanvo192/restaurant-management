import express from "express";
const router = express.Router();

import {
  getMenus,
  createMenu,
} from "../../controllers/admin/menu.controller.js";
import { uploadMenuImage } from "../../middlewares/upload.middleware.js";
router.get("/", getMenus);
router.post("/", uploadMenuImage, createMenu);

export default router;
