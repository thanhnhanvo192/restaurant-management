import express from "express";
const router = express.Router();

import { getStatistics } from "../../controllers/admin/statistic.controller.js";

router.get("/", getStatistics);

export default router;
