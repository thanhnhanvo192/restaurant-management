import express from "express";
const router = express.Router();

import {
  createMenu,
  deleteMenu,
  getMenus,
  updateMenu,
} from "../../controllers/admin/menu.controller.js";
import { uploadMenuImage } from "../../middlewares/upload.middleware.js";
router.get("/", getMenus);
router.post("/", uploadMenuImage, createMenu);
router.put("/:id", uploadMenuImage, updateMenu);
router.delete("/:id", deleteMenu);

export default router;
