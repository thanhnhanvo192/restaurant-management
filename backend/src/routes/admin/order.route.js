import express from "express";
const router = express.Router();

import { getOrders } from "../../controllers/admin/order.controller.js";

router.get("/", getOrders);

export default router;
