import { getOneVariableExpenseService } from "../services/getOneVariableExpense.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { getVariableExpenseType } from "../schemas/getVariableExpenseById.schema.js";
import { Request, Response, NextFunction } from "express";

export async function getOneVariableExpenseController(
  req: Request<getVariableExpenseType, any, any>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const variableExpense = await getOneVariableExpenseService(userId, id);

    return successResponse(res, { variableExpense: variableExpense });
  } catch (err) {
    next(err);
  }
}
