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
  }
};
