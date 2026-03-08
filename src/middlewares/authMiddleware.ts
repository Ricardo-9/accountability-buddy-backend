import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";
import { AppError } from "../core/errors/AppError.js";

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return next(new AppError("UNAUTHORIZED", "Token not provided", 401))
    }

    const [type, token] = authHeader.split(" ")

    if (type !== "Bearer" || !token) {
        return next(new AppError("UNAUTHORIZED", "Invalid token format", 401))
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
        return next(new AppError("UNAUTHORIZED", "Invalid token", 401))
    }

    req.userId = data.user.id

    next()
}