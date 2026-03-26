import { prisma } from "../../../../src/lib/prisma.js";
import { CreateVariableExpenseType } from "../schemas/createExpense.schema.js";
import { adjustBalanceWithTx } from "../helpers/adjustBalanceWithTx.helper.js";
import { Prisma } from "@prisma/client";
import { updateVariableExpenseType } from "../schemas/updateVariableExpense.schema.js";


export const variableExpenseRepository = {
  async findOneById(userId: string, expenseId: string) {
    return prisma.variableExpense.findUnique({
      where: { id: expenseId, userId },
    });
  },

  async findManyById(userId: string) {
    return prisma.variableExpense.findMany({
      where: { userId },
    });
  },

  async create(userId: string, data: CreateVariableExpenseType) {
    return await prisma.$transaction(async (tx) => {
      const expense = await tx.variableExpense.create({
        data: {
          userId,
          categoryId: data.categoryId ?? null,
          name: data.name,
          amount: new Prisma.Decimal(data.amount),
          expenseDate: data.expenseDate,
        },
      });

      await adjustBalanceWithTx({
        tx,
        userId,
        amount: data.amount,
        type: "DECREMENT",
        reason: "EXPENSE",
      });

      return expense;
    });
  },

  async update(
    userId: string,
    expenseId: string,
    data: updateVariableExpenseType,
    amountToAdjust: number | undefined,
    typeOfTransaction: "DECREMENT" | "INCREMENT",
    reasonOftransation: "INCOME" | "EXPENSE",
  ) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.variableExpense.update({
        where: { id: expenseId, userId },
        data: Object.assign(
          {},
          data.name !== undefined && { name: data.name },
          data.amount !== undefined && {
            amount: new Prisma.Decimal(data.amount),
          },
          data.expenseDate !== undefined && { expenseDate: data.expenseDate },
          "categoryId" in data && {
            categoryId: data.categoryId ?? null,
          },
        ),
      });

      if (amountToAdjust !== undefined) {
        await adjustBalanceWithTx({
          tx,
          userId,
          amount: amountToAdjust,
          type: typeOfTransaction,
          reason: reasonOftransation,
        });
      }

      return updated;
    });
  },

  async delete(userId: string, expenseId: string, amount: number ) {
    return await prisma.$transaction(async (tx) => {
      const deleted = await tx.variableExpense.delete({
        where: { id: expenseId, userId },
      });

      await adjustBalanceWithTx({
        tx,
        userId,
        amount: amount,
        type: "INCREMENT",
        reason: "INCOME",
      });

      return deleted;
    });

  },

  
};
