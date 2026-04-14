import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { createCategory } from "../services/createCategory.service.js";
export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { name } = req.body;
  try {
    const category = await createCategory(
      userId,
      name,
    );

    return successResponse(res, category, "Financial Category sucessfully created");
  } catch (err) {
    next(err);
  }
}
