import express from "express";

import {
  getProfile,
  updateNotificationSettings,
  updatePassword,
  updateProfile,
} from "../../controllers/client/profile.controller.js";
import requireCustomerAuth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireCustomerAuth, getProfile);
router.put("/", requireCustomerAuth, updateProfile);
router.put("/password", requireCustomerAuth, updatePassword);
router.put(
  "/notification-settings",
  requireCustomerAuth,
  updateNotificationSettings,
);

export default router;
