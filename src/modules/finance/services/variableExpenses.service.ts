import { VariableExpense } from "@prisma/client";
import { CreateVariableExpenseType } from "../schemas/createExpense.schema.js";
import { variableExpenseRepository } from "../repository/variableExpenses.repository.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError.js";

export async function fetchExpense(userId: string, expenseId: string): Promise<VariableExpense> {
  const expense = await variableExpenseRepository.findOneById(expenseId);

  if (!expense || expense.userId !== userId) {
    throw new AppError("NOT_FOUND", "variable expense not found", 404);
  }

  return expense;
}

export const variableExpenseService = {
  async getVariableExpense(userId: string, expenseId: string) {
    return await fetchExpense(userId,expenseId)
  },

  async getVariableExpenses(userId: string): Promise<VariableExpense[]> {
    return await variableExpenseRepository.findManyById(userId);
  },

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
