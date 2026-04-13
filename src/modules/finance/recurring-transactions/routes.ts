import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { requireArea } from "../../../middlewares/requireArea.js";
import { requireFinancialAccount } from "../middlewares/requireFinancialAccount.js";

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
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getOneRecurringTransactionSchema),
  getOneRecurringTransactionController,
);

router.get(
  "/transactions",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getRecurringTransactionSchema),
  getRecurringTransactionController,
);

router.post(
  "/transactions",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(createRecurringTransactionSchema),
  createRecurringTransactionController,
);

router.patch(
  "/transactions/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(updateRecurringTransactionSchema),
  updateRecurringTransactionController,
);

router.delete(
  "/transactions/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(deleteByIdSchema),
  deleteRecurringTransactionController,
);

export { router as recurringTransactionRoutes };