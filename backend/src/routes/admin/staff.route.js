import express from "express";
const router = express.Router();
import { getStaffs } from "../../controllers/admin/staff.controller.js";

router.get("/", getStaffs);

export default router;
