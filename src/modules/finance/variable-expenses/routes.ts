import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { requireArea } from "../../../middlewares/requireArea.js";

import { AccountabilityArea } from "@prisma/client";

import { variableExpenseController } from "./controllers/variableExpense.controller.js";

import { createVariableExpenseSchema } from "./schemas/createVariableExpense.schema.js";
import { getVariableExpenseSchema } from "./schemas/getVariableExpenseById.schema.js";
import { getVariableExpensesSchema } from "./schemas/getVariableExpenses.schema.js";
import { updateVariableExpenseSchema } from "./schemas/updateVariableExpense.schema.js";
import { deleteByIdSchema } from "../financial-categories/schemas/deletebyid.schema.js";

const router = Router();

router.get(
  "/variable-expense/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(getVariableExpenseSchema),
  variableExpenseController.getVariableExpense,
);

router.get(
  "/variable-expense",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(getVariableExpensesSchema),
  variableExpenseController.getVariableExpenses,
);

router.post(
  "/variable-expense",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createVariableExpenseSchema),
  variableExpenseController.createVariableExpense,
);

router.patch(
  "/variable-expense/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(updateVariableExpenseSchema),
  variableExpenseController.updateVariableExpense,
);

router.delete(
  "/variable-expense/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(deleteByIdSchema),
  variableExpenseController.deleteVariableExpense,
);

export { router as variableExpenseRoutes };