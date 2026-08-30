import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
// import { requireArea } from "../../../middlewares/requireArea.js";
// import { requireFinancialAccount } from "../middlewares/requireFinancialAccount.js";
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
  validateRequest(getByIdSchema),
  getOneCategoryController
);

router.get(
  "/categories",
  authenticate,
  validateRequest(getCategoriesSchema),
  getCategoriesController
);

router.post(
  "/categories",
  authenticate,
  validateRequest(createFinancialCategorySchema),
  createCategoryController
);

router.patch(
  "/categories/:id",
  authenticate,
  validateRequest(updateFinancialCategorySchema),
  updateCategoryController
);

router.delete(
  "/categories/:id",
  authenticate,
  validateRequest(deleteByIdSchema),
  deleteCategoryController
);

export { router as financialCategoriesRoutes };
