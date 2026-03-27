import { Request, Response, NextFunction } from "express";
import { getGoalsService } from "../services/getgoals.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function getGoalsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id
    const { categoryId, limit, cursor } = req.query as unknown as {
        categoryId: string,
        limit: number,
        cursor: string
    }

    try {
        const goals = await getGoalsService(
            userId,
            categoryId,
            limit,
            cursor
        )

        const nextCursor = goals.length > 0 ? goals[goals.length - 1]!.id : null

        return successResponse(
            res,
            {
                data: goals,
                nextCursor
            }
        )

    } catch (err) {
        next(err)
    }
}