import { updateVariableExpenseService } from "../services/updateVariableExpense.service.js";
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { updateVariableExpenseIdType } from "../schemas/updateVariableExpense.schema.js";

export async function updateVariableExpenseController(
  req: Request<updateVariableExpenseIdType, any, any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const data = req.body;
  const { id } = req.params;

  try {
    const updated = await updateVariableExpenseService(userId, id, data);

    return successResponse(
      res,
      { variableExpense: updated },
      "sucessfuly updated",
    );
  } catch (err) {
    next(err);
  }
}
