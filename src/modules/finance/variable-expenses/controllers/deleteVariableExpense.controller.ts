import { deleteVariableExpenseService } from "../services/deleteVariableExpense.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { Request, Response, NextFunction } from "express";
import { deleteVariableExpenseType } from "../schemas/deleteVariableExpense.schema.js";

export async function deleteVariableExpenseController(
  req: Request<deleteVariableExpenseType, any, any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;
  try {
    const deletedExpense = await deleteVariableExpenseService(userId, id);

    return successResponse(res, {variableExpense:deletedExpense}, "sucessfuly deleted");
  } catch (err) {
    next(err);
  }
}
