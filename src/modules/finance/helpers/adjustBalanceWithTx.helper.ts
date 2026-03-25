import { Prisma } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError.js";

type AdjustBalanceWithTxParams = {
  tx: Prisma.TransactionClient;
  userId: string;
  amount: number;
  type: "INCREMENT" | "DECREMENT";
  reason: "INCOME" | "EXPENSE";
};

export async function adjustBalanceWithTx({
  tx,
  userId,
  amount,
  type,
  reason,
}: AdjustBalanceWithTxParams) {
  const decimalAmount = new Prisma.Decimal(amount);

  const account = await tx.financeAccount.findUnique({
    where: { userId },
  });

  if (!account)
    throw new AppError("NOT_FOUND", "Finance account not found", 404);

  if (type === "DECREMENT" && account.balance.lt(amount))
    throw new AppError("INSUFFICIENT_FUNDS", "Insufficient balance", 422);

  const updated = await tx.financeAccount.update({
    where: { userId },
    data: {
      balance: {
        [type === "INCREMENT" ? "increment" : "decrement"]: amount,
      },
    },
    select: {
      id: true,
      userId: true,
      balance: true,
      updatedAt: true,
    },
  });

  const change =
    type === "INCREMENT" ? decimalAmount : decimalAmount.negated();

  await tx.financeBalanceHistory.create({
    data: {
      userId,
      balance: updated.balance,
      change,
      type: reason,
    },
  });

  return updated;
}