import { CreateVariableExpenseType } from "../schemas/createVariableExpense.schema.js";
import { variableExpenseRepository } from "../repositories/variableExpenses.repository.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../../../core/errors/AppError.js";

export async function createVariableExpenseService(
  userId: string,
  data: CreateVariableExpenseType,
) {
  try {
    return await variableExpenseRepository.create(userId, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        throw new AppError("INVALID_REFERENCE", "Category not found", 404);
      }
    }
    throw err;
  }
}
