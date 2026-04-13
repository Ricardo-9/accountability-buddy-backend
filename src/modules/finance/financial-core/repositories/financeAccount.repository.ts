import { Prisma } from "@prisma/client";

export const financeAccountRepository = {
  async getAccountBalance(tx: Prisma.TransactionClient, id: string) {
    return await tx.financeAccount.findUnique({
      where: { userId: id },
      select: { balance: true },
    });
  },
};
