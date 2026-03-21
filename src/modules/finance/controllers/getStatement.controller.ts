import { Request, Response, NextFunction } from "express";
import { getStatementService } from "../services/getStatement.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function getStatementController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id
    const { startDate, endDate, limit, cursor } = req.query as unknown as {
        startDate: Date,
        endDate: Date,
        limit: number,
        cursor: string
    }

    try {
        const statement = await getStatementService(
            userId,
            startDate,
            endDate,
            limit,
            cursor
        )

        const nextCursor = statement.length > 0 ? statement[statement.length - 1]!.id : null

        return successResponse(
            res,
            {
                data: statement,
                nextCursor
            }
        )
    } catch (err) {
        next(err)
    }
}