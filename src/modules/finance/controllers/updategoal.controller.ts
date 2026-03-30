import { Request, Response, NextFunction } from "express";
import { updateGoalService } from "../services/updategoal.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export async function updateGoalController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.user!.id
    const { id } = req.params
    const { name, target, initialAmount, durationValue, durationUnit, style, categoryId } = req.body

    try {
        const updateGoal = await updateGoalService(
            id as unknown as string,
            userId,
            categoryId,
            name,
            target,
            initialAmount,
            durationValue,
            durationUnit,
            style
        )

        return successResponse(res, updateGoal) 

    } catch (err) {
        next(err)
    }
}