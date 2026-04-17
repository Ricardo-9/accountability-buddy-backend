import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { requireArea } from "../../../middlewares/requireArea.js";
import { AccountabilityArea } from "@prisma/client";
import { createVariableExpenseSchema } from "./schemas/createVariableExpense.schema.js";
import { getVariableExpenseSchema } from "./schemas/getVariableExpenseById.schema.js";
import { getVariableExpensesSchema } from "./schemas/getVariableExpenses.schema.js";
import { updateVariableExpenseSchema } from "./schemas/updateVariableExpense.schema.js";
import { deleteVariableExpenseSchema } from "./schemas/deleteVariableExpense.schema.js";
import { deleteVariableExpenseController } from "./controllers/deleteVariableExpense.controller.js";
import { updateVariableExpenseController } from "./controllers/updateVariableExpense.controller.js";
import { createVariableExpenseController } from "./controllers/createVariableExpense.controller.js";
import { getVariableExpensesController } from "./controllers/getVariableExpenses.controller.js";
import { getOneVariableExpenseController } from "./controllers/getOneVariableExpense.controller.js";

const router = Router();

router.get(
  "/variable-expense/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(getVariableExpenseSchema),
  getOneVariableExpenseController,
);

router.get(
  "/variable-expense",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(getVariableExpensesSchema),
  getVariableExpensesController,
);

router.post(
  "/variable-expense",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createVariableExpenseSchema),
  createVariableExpenseController,
);

router.patch(
  "/variable-expense/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(updateVariableExpenseSchema),
  updateVariableExpenseController,
);

router.delete(
  "/variable-expense/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(deleteVariableExpenseSchema),
  deleteVariableExpenseController,
);

export { router as variableExpenseRoutes };
