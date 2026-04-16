import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { getOneCategoryService } from "../services/getOneCategory.service.js";
import { GetCategoriesSchemaType } from "../schemas/getCategories.schema.js";
import { GetByIdSchemaType } from "../schemas/getOneCategory.schema.js";

export async function getOneCategoryController(
  req: Request<GetByIdSchemaType,any,any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const {id} = req.params 
  
  try {
    const category = await getOneCategoryService(userId, id);

    return successResponse(res, { category: category });
  } catch (err) {
    next(err);
  }
}
