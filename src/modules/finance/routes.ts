import { Router } from "express";

import { financialCoreRoutes } from "./financial-core/routes.js";
import { financialCategoriesRoutes } from "./financial-categories/routes.js";
import { variableExpenseRoutes } from "./variable-expenses/routes.js";
import { financialGoalsRoutes } from "./financial-goals/routes.js";
import { recurringTransactionRoutes } from "./recurring-transactions/routes.js";

const router = Router();

router.use(financialCoreRoutes);
router.use(financialCategoriesRoutes);
router.use(variableExpenseRoutes);
router.use(financialGoalsRoutes);
router.use(recurringTransactionRoutes);

export { router as financialRoutes };
