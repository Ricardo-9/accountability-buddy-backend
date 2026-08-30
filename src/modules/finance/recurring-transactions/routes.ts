import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";

import { AccountabilityArea } from "@prisma/client";

import { createRecurringTransactionController } from "./controllers/createRecurringTransaction.controller.js";
import { getRecurringTransactionController } from "./controllers/getRecurringTransaction.controller.js";
import { getOneRecurringTransactionController } from "./controllers/getOneRecurringTransaction.controller.js";
import { updateRecurringTransactionController } from "./controllers/updateRecurringTransaction.controller.js";
import { deleteRecurringTransactionController } from "./controllers/deleteRecurringTransaction.controller.js";

import { createRecurringTransactionSchema } from "./schemas/createRecurringTransaction.schema.js";
import { getRecurringTransactionSchema } from "./schemas/getRecurringTransaction.schema.js";
import { getOneRecurringTransactionSchema } from "./schemas/getOneRecurringTransaction.schema.js";
import { updateRecurringTransactionSchema } from "./schemas/updateRecurringTransaction.schema.js";

import { deleteByIdSchema } from "../financial-categories/schemas/deletebyid.schema.js";

const router = Router();

router.get(
  "/transactions/:id",
  authenticate,
  validateRequest(getOneRecurringTransactionSchema),
  getOneRecurringTransactionController,
);

router.get(
  "/transactions",
  authenticate,
  validateRequest(getRecurringTransactionSchema),
  getRecurringTransactionController,
);

router.post(
  "/transactions",
  authenticate,
  validateRequest(createRecurringTransactionSchema),
  createRecurringTransactionController,
);

router.patch(
  "/transactions/:id",
  authenticate,
  validateRequest(updateRecurringTransactionSchema),
  updateRecurringTransactionController,
);

router.delete(
  "/transactions/:id",
  authenticate,
  validateRequest(deleteByIdSchema),
  deleteRecurringTransactionController,
);

export { router as recurringTransactionRoutes };
