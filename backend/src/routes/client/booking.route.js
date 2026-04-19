import express from "express";

import {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookings,
} from "../../controllers/client/booking.controller.js";
import requireCustomerAuth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireCustomerAuth, getBookings);
router.post("/", requireCustomerAuth, createBooking);
router.get("/:id", requireCustomerAuth, getBookingById);
router.delete("/:id", requireCustomerAuth, cancelBooking);

export default router;
