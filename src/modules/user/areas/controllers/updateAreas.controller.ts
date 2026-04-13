import { Request, Response, NextFunction } from "express";
import { updateAreasService } from "../services/updateAreas.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function updateAreasController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id
        const { areas } = req.body

        const result = await updateAreasService(userId, areas)

        return successResponse(
            res, 
            result
        )
    }
    catch (err) {
        next(err)
    }
}