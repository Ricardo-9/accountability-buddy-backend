import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { createCategoryService } from "../services/createCategory.service.js";
export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { name } = req.body;
  try {
    const category = await createCategoryService(
      userId,
      name,
    );

    return successResponse(res, category, "Financial Category sucessfully created");
  } catch (err) {
    next(err);
  }
}
