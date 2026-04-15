import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";
import { DEFAULT_FINANCIAL_CATEGORIES } from "../../consts/defaultFinancialCategories.js";

export const financeAccountRepository = {
  async getAccount(id: string) {
    return await prisma.financeAccount.findUnique({
      where: { userId: id },
      select: {
        id: true,
        userId: true,
        balance: true,
        createdAt: true,
        updatedAt: true
      }
    })
  },

  async getAccountBalance(tx: Prisma.TransactionClient, id: string) {
    return await tx.financeAccount.findUnique({
      where: { userId: id },
      select: { balance: true },
    });
  },

  async createFinancialAccount(id: string, balance: number) {
    const [account] = await prisma.$transaction([
      prisma.financeAccount.create({
        data: { userId: id, balance },
        select: {
          id: true,
          userId: true,
          balance: true,
          createdAt: true
        }
      }),
      prisma.financeBalanceHistory.create({
        data: {
          userId: id,
          balance,
          change: balance,
          type: "INITIAL_BALANCE"
        }
      }),
      prisma.financialCategory.createMany({
        data: DEFAULT_FINANCIAL_CATEGORIES.map((name) => ({
          userId: id,
          name,
          isDefault: true
        })),
        skipDuplicates: true
      })
    ])

    return account
  },

  async getStatement(
    id: string,
    limit: number,
    startDate?: Date,
    endDate?: Date,
    cursor?: string
  ) {
    return await prisma.financeBalanceHistory.findMany({
      where: {
        userId: id,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate })
          }
        } : {})
      },
      select: {
        id: true,
        balance: true,
        change: true,
        type: true,
        createdAt: true
      },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ],
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      })
    })
  }
};
