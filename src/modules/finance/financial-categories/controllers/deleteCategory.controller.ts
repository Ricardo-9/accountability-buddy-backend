import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { deleteCategory } from "../services/deleteCategory.service.js";
import { DeleteByIdSchemaType } from "../schemas/deletebyid.schema.js";

export async function deleteCategoryController(
  req: Request<DeleteByIdSchemaType, any, any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    await deleteCategory(userId, id);
    return successResponse(res, null, "Category deleted");
  } catch (err) {
    next(err);
  }
}
