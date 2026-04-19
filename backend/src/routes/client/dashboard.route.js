import express from "express";

import { getCustomerDashboard } from "../../controllers/client/dashboard.controller.js";
import requireCustomerAuth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireCustomerAuth, getCustomerDashboard);

export default router;
