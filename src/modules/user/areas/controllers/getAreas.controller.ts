import { Request, Response, NextFunction } from "express";
import { getAreasService } from "../services/getAreas.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function getAreasController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id

        const areas = await getAreasService(userId)

        return successResponse(res, areas)
    }
    catch (err) {
        next(err)
    }
}