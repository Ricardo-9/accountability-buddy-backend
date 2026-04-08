import { Request, Response, NextFunction } from "express";
import { deleteRecurringTransactionService } from "../services/deleterecurringtransaction.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";
import { DeleteByIdSchema } from "../schemas/deletebyid.schema.js";

export async function deleteRecurringTransactionController(
    req: Request<DeleteByIdSchema>,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id 
    const { id } = req.params

    try {
        await deleteRecurringTransactionService(id, userId)

        return successResponse(res, undefined, "Transaction successfully deleted")
    } catch (err) {
        next(err)
    }
}