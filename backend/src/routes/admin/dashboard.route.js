import express from "express";
const router = express.Router();

import { getDashboardData } from "../../controllers/admin/dashboard.controller.js";

router.get("/", getDashboardData);

export default router;
