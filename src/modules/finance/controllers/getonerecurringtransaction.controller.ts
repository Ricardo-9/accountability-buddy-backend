import { Request, Response, NextFunction } from "express";
import { getOneRecurringTransactionService } from "../services/getonerecurringtransaction.service.js";
import { getOneRecurringTransactionType } from "../schemas/getonerecurringtransaction.schema.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function getOneRecurringTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params as unknown as getOneRecurringTransactionType;

  try {
    const recurringTransaction = await getOneRecurringTransactionService(
      userId,
      id,
    );

    return successResponse(res, recurringTransaction);
  } catch (err) {
    next(err);
  }
}
