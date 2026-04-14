import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { requireArea } from "../../../middlewares/requireArea.js";
import { requireFinancialAccount } from "../middlewares/requireFinancialAccount.js";
import { AccountabilityArea } from "@prisma/client";
import { createGoalController } from "./controllers/createGoal.controller.js";
import { getGoalsController } from "./controllers/getGoals.controller.js";
import { updateGoalController } from "./controllers/updateGoal.controller.js";
import { goalDepositController } from "./controllers/goalDeposit.controller.js";
import { deleteGoalController } from "./controllers/deleteGoal.controller.js";
import { createGoalSchema } from "./schemas/createGoal.schema.js";
import { getGoalsSchema } from "./schemas/getGoals.schema.js";
import { updateGoalSchema } from "./schemas/updateGoal.schema.js";
import { goalDepositSchema } from "./schemas/goalDeposit.schema.js";
import { deleteByIdSchema } from "../financial-categories/schemas/deletebyid.schema.js";

const router = Router();

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

export { router as financialGoalsRoutes };