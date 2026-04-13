import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { requireArea } from "../../../middlewares/requireArea.js";
import { requireFinancialAccount } from "../middlewares/requireFinancialAccount.js";

import { AccountabilityArea } from "@prisma/client";

import { financialCategoriesControllers } from "./controllers/financialCategories.controller.js";

import { createFinancialCategorySchema } from "./schemas/createCategory.schema.js";
import { updateFinancialCategorySchema } from "./schemas/updateCategory.schema.js";
import { deleteByIdSchema } from "./schemas/deletebyid.schema.js";

const router = Router();

router.get(
  "/categories",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  financialCategoriesControllers.getCategories,
);

router.post(
  "/categories",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createFinancialCategorySchema),
  requireFinancialAccount,
  financialCategoriesControllers.createCategory,
);

router.patch(
  "/categories/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(updateFinancialCategorySchema),
  requireFinancialAccount,
  financialCategoriesControllers.updateCategory,
);

router.delete(
  "/categories/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(deleteByIdSchema),
  requireFinancialAccount,
  financialCategoriesControllers.deleteCategory,
);

export { router as financialCategoriesRoutes };