// // import { AccountabilityArea } from "@prisma/client";
// import { Request, Response, NextFunction } from "express";
// import { AppError } from "../core/errors/AppError.js";
// import { prisma } from "../lib/prisma.js";

// export function requireArea(area: AccountabilityArea) {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userId = req.user!.id;

//       const hasArea = await prisma.userArea.findFirst({
//         where: { userId, area },
//         select: { userId: true },
//       });

//       if (!hasArea)
//         throw new AppError(
//           "FORBIDDEN",
//           `User need to be registered in ${area} to access this feature`,
//           403,
//         );

//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// } 
