import express from "express";

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../../controllers/client/address.controller.js";
import requireCustomerAuth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireCustomerAuth, getAddresses);
router.post("/", requireCustomerAuth, createAddress);
router.put("/:id", requireCustomerAuth, updateAddress);
router.delete("/:id", requireCustomerAuth, deleteAddress);

export default router;
