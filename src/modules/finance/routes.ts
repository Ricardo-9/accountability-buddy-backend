import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createFinancialAccountSchema } from "./schemas/createfinancialaccount.schema.js";
import { createFinancialAccountController } from "./controllers/createfinancialaccount.controller.js";
import { adjustBalanceController } from "./controllers/adjustbalance.controller.js";
import { adjustBalanceSchema } from "./schemas/adjustbalance.schema.js";
import { requireArea } from "../../middlewares/requireArea.js";
import { AccountabilityArea } from "@prisma/client";
import { getStatementController } from "./controllers/getStatement.controller.js";
import { getStatementSchema } from "./schemas/getstatement.schema.js";
import { financialCategoriesControllers } from "./controllers/financialCategories.controller.js";
import { createFinancialCategorySchema } from "./schemas/createCategory.schema.js";
import { updateFinancialCategorySchema } from "./schemas/updateCategory.schema.js";
import { deleteFinancialCategorySchema } from "./schemas/deleteCategory.schema.js";
import { getAccountController } from "./controllers/getaccount.controller.js";
import { createVariableExpenseSchema } from "./schemas/createExpense.schema.js";
import { variableExpenseController } from "./controllers/variableExpense.controller.js";
import { createGoalController } from "./controllers/creategoal.controller.js";
import { createGoalSchema } from "./schemas/creategoal.schema.js";

const router = Router();

//financialCore
router.post(
  "/accounts",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createFinancialAccountSchema),
  createFinancialAccountController,
);

router.get(
  "/accounts",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  getAccountController,
);

router.patch(
  "/accounts/balance",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(adjustBalanceSchema),
  adjustBalanceController,
);

router.get(
  "/accounts/statement",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(getStatementSchema),
  getStatementController,
);

//financialCategories
router.get(
  "/categories",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  financialCategoriesControllers.getCategories,
);

router.post(
  "/categories",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createFinancialCategorySchema),
  financialCategoriesControllers.createCategory,
);

router.patch(
  "/categories/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(updateFinancialCategorySchema),
  financialCategoriesControllers.updateCategory,
);

router.delete(
  "/categories/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(deleteFinancialCategorySchema),
  financialCategoriesControllers.deleteCategory,
);

//variableExpenses
router.post(
  "/variable-expense",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createVariableExpenseSchema),
  variableExpenseController.createVariableExpense,
);

//financialgoals
router.post(
  "/goals",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createGoalSchema),
  createGoalController
)

export { router as financialRoutes };
