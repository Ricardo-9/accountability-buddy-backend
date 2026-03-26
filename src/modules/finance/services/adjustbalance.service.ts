import {prisma} from '../../../lib/prisma.js';
import { adjustBalanceWithTx } from '../helpers/adjustBalanceWithTx.helper.js';


export async function adjustBalanceService(
  userId: string,
  amount: number,
  type: "INCREMENT" | "DECREMENT",
  reason: "INCOME" | "EXPENSE"
) {
  return await prisma.$transaction(async (tx) => {
    return adjustBalanceWithTx({ tx, userId, amount, type, reason });
  });
}