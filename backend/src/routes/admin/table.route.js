import express from "express";
const router = express.Router();

import {
  getTables,
  createTable,
  updateTable,
} from "../../controllers/admin/table.controller.js";

router.get("/", getTables);
router.post("/", createTable);
router.put("/:id", updateTable);

export default router;
