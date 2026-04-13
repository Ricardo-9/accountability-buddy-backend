import { Prisma } from "@prisma/client";
import { AppError } from "../../../../core/errors/AppError.js";

export function handleUserProfileError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      throw new AppError("NOT_FOUND", "Profile not found", 404);
    }
  }
  throw err;
}
