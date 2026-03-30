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
import { getGoalsSchema } from "./schemas/getgoals.schema.js";
import { getGoalsController } from "./controllers/getgoals.controller.js";
import { requireFinancialAccount } from "./middlewares/requireFinancialAccount.js";
import { updateGoalSchema } from "./schemas/updategoal.schema.js";
import { updateAreasController } from "../user/areas/controllers/updateareas.controller.js";
import { updateGoalController } from "./controllers/updategoal.controller.js";

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
  requireFinancialAccount,
  getAccountController,
);

router.patch(
  "/accounts/balance",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(adjustBalanceSchema),
  requireFinancialAccount,
  adjustBalanceController,
);

router.get(
  "/accounts/statement",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(getStatementSchema),
  requireFinancialAccount,
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
  requireFinancialAccount,
  validateRequest(createGoalSchema),
  createGoalController
)

router.get(
  "/goals",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getGoalsSchema),
  getGoalsController
)

router.patch(
  "/goals/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(updateGoalSchema),
  updateGoalController
)

export { router as financialRoutes };
