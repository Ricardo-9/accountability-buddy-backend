// import { Request, Response, NextFunction } from "express";
// import { prisma } from "../../../lib/prisma.js";
// import { AppError } from "../../../core/errors/AppError.js";

// export async function requireFinancialAccount(
//   req: Request,
//   _res: Response,
//   next: NextFunction,
// ) {
//   try {
//     const userId = req.user!.id;

//     const account = await prisma.financeAccount.findUnique({
//       where: { userId },
//       select: { id: true },
//     });

//     if (!account)
//       throw new AppError("NOT_FOUND", "User account not found", 404);

//     next();
//   } catch (err) {
//     next(err);
//   }
// }
