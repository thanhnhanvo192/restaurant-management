import express from "express";

import { getMenus } from "../../controllers/client/menu.controller.js";

const router = express.Router();

router.get("/", getMenus);

export default router;
