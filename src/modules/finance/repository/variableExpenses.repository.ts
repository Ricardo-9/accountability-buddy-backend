import { prisma } from "../../../../src/lib/prisma.js";
import { CreateVariableExpenseType } from "../schemas/createExpense.schema.js";
import { adjustBalanceWithTx } from "../helpers/adjustBalanceWithTx.helper.js";
import { Prisma } from "@prisma/client";

export const variableExpenseRepository = {
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

  async findManyById(userId:string){
    return prisma.variableExpense.findMany({
      where: {userId}
    })
  }

  
};
