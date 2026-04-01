import { Request, Response, NextFunction } from "express";
import { deleteGoalService } from "../services/deletegoal.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function deleteGoalController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id
    const { id } = req.params

    try {
        const deletedGoal = await deleteGoalService(id as unknown as string, userId)

        return successResponse(res, deletedGoal)
    } catch (err) {
        next(err)
    }
}