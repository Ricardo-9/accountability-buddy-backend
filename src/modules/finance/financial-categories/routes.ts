import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { requireArea } from "../../../middlewares/requireArea.js";
import { requireFinancialAccount } from "../middlewares/requireFinancialAccount.js";
import { AccountabilityArea } from "@prisma/client";
import { createCategoryController } from "./controllers/createCategory.controller.js";
import { getCategoriesController } from "./controllers/getCategories.controller.js";
import { updateCategoryController } from "./controllers/updateCategory.controller.js";
import { deleteCategoryController } from "./controllers/deleteCategory.controller.js";
import { createFinancialCategorySchema } from "./schemas/createCategory.schema.js";
import { updateFinancialCategorySchema } from "./schemas/updateCategory.schema.js";
import { deleteByIdSchema } from "./schemas/deletebyid.schema.js";
import { getByIdSchema } from "./schemas/getOneCategory.schema.js";
import { getOneCategoryController } from "./controllers/getOneCategory.controller.js";
import { getCategoriesSchema } from "./schemas/getCategories.schema.js";

const router = Router();

router.get(
  "/categories/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getByIdSchema),
  getOneCategoryController
);

router.get(
  "/categories",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  requireFinancialAccount,
  validateRequest(getCategoriesSchema),
  getCategoriesController
);

router.post(
  "/categories",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(createFinancialCategorySchema),
  requireFinancialAccount,
  createCategoryController
);

router.patch(
  "/categories/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(updateFinancialCategorySchema),
  requireFinancialAccount,
  updateCategoryController
);

router.delete(
  "/categories/:id",
  authenticate,
  requireArea(AccountabilityArea.FINANCES),
  validateRequest(deleteByIdSchema),
  requireFinancialAccount,
  deleteCategoryController
);

export { router as financialCategoriesRoutes };