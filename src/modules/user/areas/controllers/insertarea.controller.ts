import { Request, Response, NextFunction } from "express";
import { insertAreaService } from "../services/insertarea.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function insertAreaController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const id = req.user!.id
        const { area } = req.body

        const result = await insertAreaService(id, area)

        return successResponse(res, result, `User successfully signed up for ${result.area}`)
    }
    catch (err) {
        next(err)
    }
}