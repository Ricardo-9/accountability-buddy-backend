import { Request, Response, NextFunction } from "express";
import { getRecurringTransactionService } from "../services/getRecurringTransaction.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { getRecurringTransactionType } from "../schemas/getRecurringTransaction.schema.js";

export async function getRecurringTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const data = req.query as unknown as getRecurringTransactionType;

  try {
    const recurringtransactions = await getRecurringTransactionService(
      userId,
      data,
    );

    return successResponse(res, recurringtransactions);
  } catch (err) {
    next(err);
  }
}
