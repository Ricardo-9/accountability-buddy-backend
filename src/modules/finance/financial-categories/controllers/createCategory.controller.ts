import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { financialCategoriesServices } from "../services/financialCategories.service.js";

export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
}
