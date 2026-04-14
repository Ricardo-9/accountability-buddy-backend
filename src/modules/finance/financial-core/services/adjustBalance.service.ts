import { BalanceChangeType } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";

export async function adjustBalanceService(
  userId: string,
  amount: number,
  type: "INCREMENT" | "DECREMENT",
  reason: BalanceChangeType,
) {
  return await prisma.$transaction(async (tx) => {
    return adjustBalanceWithTx({ tx, userId, amount, type, reason });
  });
}
