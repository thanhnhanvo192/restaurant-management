import express from "express";
const router = express.Router();

import { getMenus } from "../../controllers/admin/menu.controller.js";
router.get("/", getMenus);

export default router;
