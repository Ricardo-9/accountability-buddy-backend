import { VariableExpense } from "@prisma/client";
import { CreateVariableExpenseType } from "../schemas/createExpense.schema.js";
import { variableExpenseRepository } from "../repository/variableExpenses.repository.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError.js";

export const variableExpenseService = {
  async createVariableExpense(
    userId: string,
    data: CreateVariableExpenseType,
  ): Promise<VariableExpense> {
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
  },
};
