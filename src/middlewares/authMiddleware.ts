// // This middleware verifies the JWT token from the Authorization header using the JWKs provided by Supabase.

// import { Request, Response, NextFunction } from "express";
// import { createRemoteJWKSet, jwtVerify } from "jose";
// import { AppError } from "../core/errors/AppError.js";
// import { config } from "../config/env.js";

// const JWKS = createRemoteJWKSet(
//   new URL(`${config.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
// );

// export const authenticate = async (
//   req: Request,
//   _res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       throw new AppError("UNAUTHORIZED", "Missing Authorization header", 401);
//     }

//     const token = authHeader.replace("Bearer ", "");

//     const { payload } = await jwtVerify(token, JWKS, {
//       issuer: `${config.SUPABASE_URL}/auth/v1`,
//       audience: "authenticated",
//     });

//     req.user = {
//       id: payload.sub as string,
//       email: payload.email as string,
//     };

//     return next();
//   } catch (error) {
//     return next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
//   }
// };


// This middleware verifies the JWT token from the Authorization header using the JWKs provided by Supabase.

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
    console.log("[AUTH] Middleware executado");
    console.log("[AUTH] Authorization:", req.headers.authorization ? "presente" : "ausente");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        "UNAUTHORIZED",
        "Missing Authorization header",
        401,
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${config.SUPABASE_URL}/auth/v1`,
      audience: "authenticated",
    });

    console.log("[AUTH] JWT válido");
    console.log("[AUTH] sub:", payload.sub);
    console.log("[AUTH] email:", payload.email);

    if (!payload.sub) {
      throw new AppError(
        "UNAUTHORIZED",
        "Token does not contain a user id",
        401,
      );
    }

    req.user = {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
    };

    console.log("[AUTH] req.user definido:", req.user);

    return next();
  } catch (error) {
    console.error("[AUTH] Erro:", error);

    return next(
      new AppError(
        "UNAUTHORIZED",
        "Invalid or expired token",
        401,
      ),
    );
  }
};


