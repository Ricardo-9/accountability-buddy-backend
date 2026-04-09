import { Request, Response, NextFunction } from "express";
import { CreateRecurringTransaction } from "../schemas/createrecurringtransaction.schema.js";
import { createRecurringTransactionService } from "../services/createrecurringtransaction.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function createRecurringTransactionController(
    req: Request<{}, {}, CreateRecurringTransaction>,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id
    const data = req.body 

    try {
        const transaction = await createRecurringTransactionService(userId, data)

        return successResponse(res, transaction, undefined, 201)

    } catch (err) {
        next(err)
    }
}