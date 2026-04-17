import { prisma } from "../../../../lib/prisma.js";
import { CreateVariableExpenseType } from "../schemas/createVariableExpense.schema.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";
import { Prisma } from "@prisma/client";
import { updateVariableExpenseType } from "../schemas/updateVariableExpense.schema.js";

export const variableExpenseRepository = {
  async findOneById(userId: string, expenseId: string) {
    return prisma.variableExpense.findUnique({
      where: { id: expenseId, userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        amount: true,
        expenseDate: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async findManyById(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string,
    limit = 10,
    cursor?: string,
  ) {
    return prisma.variableExpense.findMany({
      where: {
        userId,
        ...((startDate || endDate) && {
          expenseDate: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }),
        ...(categoryId && { categoryId: categoryId }),
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        amount: true,
        expenseDate: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ expenseDate: "desc" }, { id:"desc" }],
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
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
        select: {
          id: true,
          name: true,
          amount: true,
          expenseDate: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
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
        where: { id: expenseId, userId, deletedAt: null },
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
        select: {
          id: true,
          name: true,
          amount: true,
          expenseDate: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
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

  async delete(userId: string, expenseId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      const deleted = await tx.variableExpense.update({
        where: { id: expenseId, userId, deletedAt: null },
        data: { deletedAt: new Date() },
        select: {
          id: true,
          name: true,
          amount: true,
          expenseDate: true,
          deletedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
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
