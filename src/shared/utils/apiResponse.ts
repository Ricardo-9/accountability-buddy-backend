import { Response } from "express";

export function successResponse(
    res: Response,
    data: unknown,
    message?: string,
    status = 200
) {
    return res.status(status).json({
        success: true,
        data,
        message
    })
}

export function errorResponse(
    res: Response,
    code: string,
    message: string,
    status = 400,
) {
    return res.status(status).json({
        success: false,
        error: {
            code,
            message
        }
    })
}