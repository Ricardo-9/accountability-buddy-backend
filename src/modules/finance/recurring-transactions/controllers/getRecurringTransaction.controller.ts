import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { getRecurringTransactionService } from "../services/getRecurringTransaction.service.js";
import { GetRecurringTransactionSchemaType } from "../schemas/getRecurringTransaction.schema.js";

export async function getRecurringTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { limit, cursor, type, categoryId, startDate, endDate } = req.query as unknown as GetRecurringTransactionSchemaType;

  try {
    const result = await getRecurringTransactionService(userId, limit, cursor, type, categoryId, startDate, endDate);

    const hasNextPage = result.length > limit;
    const transactions = hasNextPage ? result.slice(0, -1) : result;
    const nextCursor = hasNextPage ? transactions.at(-1)?.id : null;

    return successResponse(res, { 
      recurringTransactions: transactions, 
      nextCursor 
    });
  } catch (err) {
    next(err);
  }
}