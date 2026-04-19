import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
} from "../../controllers/client/order.controller.js";
import requireCustomerAuth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", requireCustomerAuth, createOrder);
router.get("/", requireCustomerAuth, getOrders);
router.get("/:id", requireCustomerAuth, getOrderById);

export default router;
