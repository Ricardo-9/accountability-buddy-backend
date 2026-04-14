import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { financialCategoriesServices } from "../services/financialCategories.service.js";
import { updatefinancialCategoryIdType } from "../schemas/updateCategory.schema.js";

export async function updateCategoryController(
  req: Request<updatefinancialCategoryIdType, any, any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { name } = req.body;
  const { id } = req.params;
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
}
