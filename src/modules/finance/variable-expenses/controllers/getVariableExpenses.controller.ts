import { getVariableExpensesService } from "../services/getVariableExpenses.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { GetVariableExpensesQueryType } from "../schemas/getVariableExpenses.schema.js";
import { Request, Response, NextFunction } from "express";

export async function getVariableExpensesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { startDate, endDate, categoryId, limit, cursor } = req.query as unknown as GetVariableExpensesQueryType;

  try {
    const variableExpenses = await getVariableExpensesService(
      userId,
      startDate,
      endDate,
      categoryId,
      limit,
      cursor,
    );

    const hasNextPage = variableExpenses.length > limit;
    const data = hasNextPage ? variableExpenses.slice(0, -1) : variableExpenses;

    const nextCursor = hasNextPage ? data.at(-1)?.id : null;

    return successResponse(res, {
      variableExpenses: data,
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
}