import { Request, Response, NextFunction } from "express";
import { deleteGoalService } from "../services/deleteGoal.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { DeleteByIdSchemaType } from "../../financial-categories/schemas/deletebyid.schema.js";

export async function deleteGoalController(
  req: Request<DeleteByIdSchemaType>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const deletedGoal = await deleteGoalService(id, userId);

    return successResponse(res, deletedGoal);
  } catch (err) {
    next(err);
  }
}
