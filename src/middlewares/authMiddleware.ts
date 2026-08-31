import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { AppError } from "../core/errors/AppError.js";
import { config } from "../config/env.js";

const JWKS = createRemoteJWKSet(
  new URL(`${config.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        "UNAUTHORIZED",
        "Missing Authorization header",
        401,
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "UNAUTHORIZED",
        "Invalid Authorization header",
        401,
      );
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      throw new AppError(
        "UNAUTHORIZED",
        "Missing token",
        401,
      );
    }

    console.log("[AUTH] Authorization header received");
    console.log("[AUTH] Token length:", token.length);
    console.log("[AUTH] Supabase URL:", config.SUPABASE_URL);

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${config.SUPABASE_URL}/auth/v1`,
      audience: "authenticated",
    });

    console.log("[AUTH] JWT verified successfully");
    console.log("[AUTH] JWT payload:", {
      sub: payload.sub,
      email: payload.email,
      iss: payload.iss,
      aud: payload.aud,
      exp: payload.exp,
    });

    if (!payload.sub) {
      throw new AppError(
        "UNAUTHORIZED",
        "Token does not contain user id",
        401,
      );
    }

    req.user = {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
    };

    return next();
  } catch (error) {
    console.error("[AUTH] JWT verification failed:", error);

    return next(
      new AppError(
        "UNAUTHORIZED",
        "Invalid or expired token",
        401,
      ),
    );
  }
};
