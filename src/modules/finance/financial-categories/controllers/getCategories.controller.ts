import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { getCategories } from "../services/getCategories.service.js";

export async function getCategoriesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  try {
    const categories = await getCategories(userId);

    return successResponse(res, categories);
  } catch (err) {
    next(err);
  }
}
