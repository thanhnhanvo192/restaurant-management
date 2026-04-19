import express from "express";

import {
  adminLogin,
  adminLogout,
  adminMe,
  adminRefresh,
  login,
  logout,
  me,
  refresh,
} from "../controllers/auth.controller.js";
import {
  requireAdminAuth,
  requireCustomerAuth,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", requireCustomerAuth, me);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

router.get("/admin/me", requireAdminAuth, adminMe);
router.post("/admin/login", adminLogin);
router.post("/admin/logout", adminLogout);
router.post("/admin/refresh", adminRefresh);

export default router;
