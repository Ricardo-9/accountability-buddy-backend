import { Prisma, RecurrenceUnit, TransactionType } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { updateRecurringTransactionBodyType } from "../schemas/updateRecurringTransaction.schema.js";

type Tx = Prisma.TransactionClient | PrismaClient;

type CreateRecurringTransactionDTO = {
  type: TransactionType;
  name: string;
  amount: number;
  recurrenceValue: number;
  recurrenceUnit: RecurrenceUnit;
  nextOccurrence: Date;
  categoryId: string | null;
  dayOfMonth: number | null;
};

export const recurringTransactionRepository = {
  async findById(tx: Tx, userId: string, id: string) {
    return await tx.recurringTransaction.findFirst({
      where: { id, userId, deletedAt: null },
    });
  },

  async updateRecurringTransaction(
    tx: Tx,
    id: string,
    userId: string,
    data: updateRecurringTransactionBodyType & { nextOccurrence: Date },
  ) {
    const result = await tx.recurringTransaction.updateMany({
      where: { id, userId, deletedAt: null },
      data: {
        ...data,
        amount:
          data.amount !== undefined
            ? new Prisma.Decimal(data.amount)
            : undefined,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return await tx.recurringTransaction.findFirst({
      where: { id, userId },
      select: {
        id: true,
        userId: true,
        categoryId: true,
        type: true,
        name: true,
        amount: true,
        recurrenceValue: true,
        recurrenceUnit: true,
        dayOfMonth: true,
        nextOccurrence: true,
        updatedAt: true,
      },
    });
  },

  async findPendingTransactions(prisma: PrismaClient) {
    const now = new Date();
    return await prisma.recurringTransaction.findMany({
      where: {
        nextOccurrence: { lte: now },
        deletedAt: null,
      },
      select: { id: true },
    });
  },

  async createTransactionExecution(
    tx: Tx,
    data: {
      transactionId: string;
      amount: Prisma.Decimal;
      executedAt: Date;
      balanceBefore: Prisma.Decimal;
      balanceAfter: Prisma.Decimal;
    },
  ) {
    return await tx.recurringTransactionExecution.create({ data });
  },

  async updateNextOccurrence(
    tx: Tx,
    id: string,
    data: {
      lastExecutedAt: Date;
      nextOccurrence: Date;
    },
  ) {
    return await tx.recurringTransaction.update({
      where: { id },
      data,
    });
  },

  async createRecurringTransaction(
    tx: Tx,
    userId: string,
    data: CreateRecurringTransactionDTO,
  ) {
    return await tx.recurringTransaction.create({
      data: {
        userId,
        ...data,
        amount: new Prisma.Decimal(data.amount),
      },
      select: {
        id: true,
        userId: true,
        categoryId: true,
        type: true,
        name: true,
        amount: true,
        recurrenceValue: true,
        recurrenceUnit: true,
        dayOfMonth: true,
        createdAt: true,
        nextOccurrence: true,
      },
    });
  },

  async deleteRecurringTransaction(
    tx: Tx,
    userId: string,
    id: string
  ) {
    return await tx.recurringTransaction.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() }
    })
  }
};
