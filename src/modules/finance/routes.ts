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
import { getAccountController } from "./controllers/getaccount.controller.js";
import { createVariableExpenseSchema } from "./schemas/createExpense.schema.js";
import { variableExpenseController } from "./controllers/variableExpense.controller.js";
import { createGoalController } from "./controllers/creategoal.controller.js";
import { createGoalSchema } from "./schemas/creategoal.schema.js";
import { getGoalsSchema } from "./schemas/getgoals.schema.js";
import { getGoalsController } from "./controllers/getgoals.controller.js";
import { requireFinancialAccount } from "./middlewares/requireFinancialAccount.js";
import { updateGoalSchema } from "./schemas/updategoal.schema.js";
import { updateGoalController } from "./controllers/updategoal.controller.js";
import { goalDepositSchema } from "./schemas/goaldeposit.schema.js";
import { goalDepositController } from "./controllers/goaldeposit.controller.js";
import { deleteGoalController } from "./controllers/deletegoal.controller.js";
import { getVariableExpenseSchema } from "./schemas/getVariableExpenseById.schema.js";
import { updateVariableExpenseSchema } from "./schemas/updateVariableExpense.schema.js";
import { getVariableExpensesSchema } from "./schemas/getVariableExpenses.schema.js";
import { createRecurringTransactionSchema } from "./schemas/createrecurringtransaction.schema.js";
import { createRecurringTransactionController } from "./controllers/createrecurringtransaction.controller.js";
import { getRecurringTransactionSchema } from "./schemas/getrecurringtransaction.schema.js";
import { getrecurringtransactionController } from "./controllers/getrecurringtransaction.controller.js";
import { getOneRecurringTransactionSchema } from "./schemas/getonerecurringtransaction.schema.js";
import { getOneRecurringTransactionController } from "./controllers/getonerecurringtransaction.controller.js";
import { deleteByIdSchema } from "./schemas/deletebyid.schema.js";
import { deleteRecurringTransactionController } from "./controllers/deleterecurringtransaction.controller.js";


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
  validateRequest(deleteByIdSchema),
  financialCategoriesControllers.deleteCategory,
);

//variableExpenses

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

//financialgoals
router.post(
  "/goals",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(createGoalSchema),
  createGoalController,
);

router.get(
  "/goals",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getGoalsSchema),
  getGoalsController,
);

router.patch(
  "/goals/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(updateGoalSchema),
  updateGoalController,
);

router.post(
  "/goals/deposit/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(goalDepositSchema),
  goalDepositController,
);

router.delete(
  "/goals/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(deleteByIdSchema),
  deleteGoalController,
);

//transactions

router.get(
  "/transactions/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getOneRecurringTransactionSchema),
  getOneRecurringTransactionController
)

router.get(
  "/transactions",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getRecurringTransactionSchema),
  getrecurringtransactionController
)

router.post(
  "/transactions",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(createRecurringTransactionSchema),
  createRecurringTransactionController
)

router.delete(
  "/transactions/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(deleteByIdSchema),
  deleteRecurringTransactionController
)

export { router as financialRoutes };
