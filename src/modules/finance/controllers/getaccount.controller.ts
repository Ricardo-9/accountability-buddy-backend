import { Request, Response, NextFunction } from "express";
import { getAccountService } from "../services/getaccount.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function getAccountController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id

    try {
        const account = await getAccountService(userId)

        return successResponse(
            res,
            {
                accountId: account!.id,
                ownerId: account!.userId,
                balance: account!.balance,
                createdAt: account!.createdAt,
                updatedAt: account!.updatedAt
            }
        )
    } catch (err) {
        next(err)
    }
}