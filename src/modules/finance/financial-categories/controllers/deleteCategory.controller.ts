import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { financialCategoriesServices } from "../services/financialCategories.service.js";
import { DeleteByIdSchemaType } from "../schemas/deletebyid.schema.js";

export async function deleteCategoryController(
  req: Request<DeleteByIdSchemaType, any, any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    await financialCategoriesServices.deleteCategory(userId, id);
    return successResponse(res, null, "Category deleted");
  } catch (err) {
    next(err);
  }
}
