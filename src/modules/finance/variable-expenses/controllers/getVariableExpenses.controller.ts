import { getVariableExpensesService } from "../services/getVariableExpenses.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { GetVariableExpensesQueryType } from "../schemas/getVariableExpenses.schema.js";
import { Request, Response, NextFunction } from "express";

export async function getVariableExpensesController(
  req: Request<any, any, any, GetVariableExpensesQueryType>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const filters = req.query;

  try {
    const variableExpenses = await getVariableExpensesService(userId, filters);

    return successResponse(res, { variableExpenses: variableExpenses });
  } catch (err) {
    next(err);
  }
}
