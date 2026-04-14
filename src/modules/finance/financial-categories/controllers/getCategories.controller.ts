import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { getCategories } from "../services/getCategories.service.js";
import { GetCategoriesSchemaType } from "../schemas/getCategories.schema.js";

export async function getCategoriesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { limit, cursor } = req.query as unknown as GetCategoriesSchemaType;
  try {
    const categories = await getCategories(userId, limit, cursor);

    const hasNextPage = categories.length > limit;
    const data = hasNextPage ? categories.slice(0, -1) : categories;

    const nextCursor = hasNextPage ? data.at(-1)?.id : null;

    return successResponse(res, { categories: categories, nextCursor });
  } catch (err) {
    next(err);
  }
}
