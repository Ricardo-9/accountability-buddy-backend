import { Request, Response, NextFunction } from "express";
import { updateRecurringTransactionService } from "../services/updaterecurringtransaction.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";
import { updateRecurringTransactionIdType } from "../schemas/updaterecurringtransaction.schema.js";

export async function updateRecurringTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params as unknown as updateRecurringTransactionIdType;
  const data = req.body;

  try {
    const transaction = await updateRecurringTransactionService(
      id,
      userId,
      data,
    );

    return successResponse(res, transaction);
  } catch (err) {
    next(err);
  }
}
