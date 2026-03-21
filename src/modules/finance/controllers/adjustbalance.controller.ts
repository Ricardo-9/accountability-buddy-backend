import { Request, Response, NextFunction } from "express";
import { adjustBalanceService } from "../services/adjustbalance.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function adjustBalanceController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id
    const { amount, type, reason } = req.body

    try {
        const updated = await adjustBalanceService(userId, amount, type, reason)

        return successResponse(
            res,
            {
                accountId: updated.id,
                ownerId: updated.userId,
                balance: updated.balance,
                updatedAt: updated.updatedAt
            }
        )
    } catch (err) {
        next(err)
    }
}