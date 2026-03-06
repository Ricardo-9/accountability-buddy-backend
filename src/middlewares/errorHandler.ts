import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors/AppError.js";
import { z, ZodError } from "zod";

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
){
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details ?? null
            }
        })
    }

    if(err instanceof ZodError){
        return res.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid data",
                details: z.treeifyError(err)
            }
        })
    }
    
    console.error(err)
    
    return res.status(500).json({
        error: {
            code: "SERVER_ERROR",
            message: "Internal server error"
        }
    })

}