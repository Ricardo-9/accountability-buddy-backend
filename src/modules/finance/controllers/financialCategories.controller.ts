import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../shared/utils/apiResponse.js";
import { financialCategoriesServices } from "../services/financialCategories.service.js";
import {
  updateFinancialCategoryBody,
  updatefinancialCategoryId,
} from "../schemas/updateCategory.schema.js";
import { DeleteByIdSchema as deletefinancialCategoryId } from "../schemas/deletebyid.schema.js";
export const financialCategoriesControllers = {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    try {
      const categories =
        await financialCategoriesServices.getCategories(userId);

      return successResponse(res, categories);
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const { name } = req.body;
    const { id } = req.params as unknown as updatefinancialCategoryId;
    try {
      const updatedCategory = await financialCategoriesServices.updateCategory(
        userId,
        id,
        name,
      );

      return successResponse(res, updatedCategory, "Category updated");
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const { name } = req.body;
    try {
      const category = await financialCategoriesServices.createCategory(
        userId,
        name,
      );

      return successResponse(res, category, "Category created");
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const { id } = req.params as unknown as deletefinancialCategoryId;

    try {
      await financialCategoriesServices.deleteCategory(userId, id);
      return successResponse(res, null, "Category deleted");
    } catch (err) {
      next(err);
    }
  },
};
