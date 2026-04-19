import express from "express";

import {
  getBookableTableById,
  getCustomerTables,
} from "../../controllers/client/table.controller.js";

const router = express.Router();

router.get("/", getCustomerTables);
router.get("/:id", getBookableTableById);

export default router;
