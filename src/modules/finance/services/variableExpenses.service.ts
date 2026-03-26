import { VariableExpense } from "@prisma/client";
import { CreateVariableExpenseType } from "../schemas/createExpense.schema.js";
import { variableExpenseRepository } from "../repository/variableExpenses.repository.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError.js";
import { updateVariableExpenseType } from "../schemas/updateVariableExpense.schema.js";

export async function fetchExpense(
  userId: string,
  expenseId: string,
): Promise<VariableExpense> {
  const expense = await variableExpenseRepository.findOneById(
    userId,
    expenseId,
  );

  if (!expense) {
    throw new AppError("NOT_FOUND", "variable expense not found", 404);
  }

  return expense;
}

export const variableExpenseService = {
  async getVariableExpense(userId: string, expenseId: string) {
    return await fetchExpense(userId, expenseId);
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

  async updateVariableExpense(
    userId: string,
    expenseId: string,
    data: updateVariableExpenseType,
  ): Promise<VariableExpense> {
    const current = await fetchExpense(userId, expenseId);

    let typeOfTransaction: "DECREMENT" | "INCREMENT" = "DECREMENT";
    let reasonOftransation: "INCOME" | "EXPENSE" = "EXPENSE";
    let amountToAdjust = data.amount;

    if (data.amount !== undefined) {
      const currentAmount = current.amount.toNumber();
      const newAmount = data.amount;
      const diff = newAmount - currentAmount;

      if (diff > 0) {
        typeOfTransaction = "DECREMENT";
        reasonOftransation = "EXPENSE";
        amountToAdjust = diff;
      } else if (diff < 0) {
        typeOfTransaction = "INCREMENT";
        reasonOftransation = "INCOME";
        amountToAdjust = Math.abs(diff);
      } else {
        amountToAdjust = undefined;
      }
    }

    try {
      return await variableExpenseRepository.update(
        userId,
        expenseId,
       data,
       amountToAdjust,
        typeOfTransaction,
        reasonOftransation,
      );
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new AppError("INVALID_REFERENCE", "Category not found", 404);
      }
      throw err;
    }
  },

  async deleteExpense(userId:string, expenseId:string){
    const {amount} = await fetchExpense(userId,expenseId)

    return await variableExpenseRepository.delete(userId,expenseId,amount.toNumber())
  }
};
