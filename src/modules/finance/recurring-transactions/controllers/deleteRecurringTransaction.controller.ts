import { Request, Response, NextFunction } from "express";
import { deleteRecurringTransactionService } from "../services/deleteRecurringTransaction.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { DeleteByIdSchemaType } from "../../financial-categories/schemas/deletebyid.schema.js";

export async function deleteRecurringTransactionController(
  req: Request<DeleteByIdSchemaType>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    await deleteRecurringTransactionService(id, userId);

    return successResponse(res, undefined, "Transaction successfully deleted");
  } catch (err) {
    next(err);
  }
}
