import { createVariableExpenseService } from "../services/createVariableExpense.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { Request, Response, NextFunction } from "express";

export async function createVariableExpenseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const data = req.body;

  try {
    const variableExpense = await createVariableExpenseService(userId, data);

    return successResponse(res, {variableExpense: variableExpense}, "Variable Expense registered");
  } catch (err) {
    next(err);
  }
}
