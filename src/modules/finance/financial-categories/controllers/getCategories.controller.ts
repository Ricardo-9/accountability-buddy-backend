import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { financialCategoriesServices } from "../services/financialCategories.service.js";

export async function getCategoriesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  try {
    const categories = await financialCategoriesServices.getCategories(userId);

    return successResponse(res, categories);
  } catch (err) {
    next(err);
  }
}
