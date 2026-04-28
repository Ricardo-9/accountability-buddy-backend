import { Prisma, RecurrenceUnit, TransactionType } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";

type CreateRecurringTransactionDTO = {
  type: TransactionType;
  name: string;
  amount: number;
  recurrenceValue: number;
  recurrenceUnit: RecurrenceUnit;
  nextOccurrence: Date;
  categoryId: string | null;
  dayOfMonth: number | null;
}

export const recurringTransactionRepository = {
  async findById(tx: Prisma.TransactionClient, id: string) {
    return await tx.recurringTransaction.findUnique({
      where: { id, deletedAt: null },
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
    tx: Prisma.TransactionClient,
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
    tx: Prisma.TransactionClient,
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
    tx: Prisma.TransactionClient | PrismaClient,
    userId: string,
    data: CreateRecurringTransactionDTO
  ) {
    return await tx.recurringTransaction.create({
      data: {
        userId,
        ...data,
        amount: new Prisma.Decimal(data.amount)
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
      }
    })
  }
};
