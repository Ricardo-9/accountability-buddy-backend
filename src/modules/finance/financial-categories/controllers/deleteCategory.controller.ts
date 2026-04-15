import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { deleteCategoryService } from "../services/deleteCategory.service.js";
import { DeleteByIdSchemaType } from "../schemas/deletebyid.schema.js";

export async function deleteCategoryController(
  req: Request<DeleteByIdSchemaType, any, any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const deletedCategory = await deleteCategoryService(userId, id);
    return successResponse(
      res,
      deletedCategory,
      "Financial Category sucessfully deleted",
    );
  } catch (err) {
    next(err);
  }
}
