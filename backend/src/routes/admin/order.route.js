import express from "express";
const router = express.Router();

import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../../controllers/admin/order.controller.js";

router.get("/", getOrders);
router.post("/", createOrder);
router.patch("/:id/status", updateOrderStatus);

export default router;
