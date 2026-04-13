import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";

export async function deleteGoalService(id: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.financialGoal.findUnique({
      where: { id, userId, deletedAt: null },
      select: { initialAmount: true },
    });

    if (!goal) throw new AppError("NOT_FOUND", "Financial goal not found", 404);

    const deposit = await tx.goalProgressSnapshot.findFirst({
      where: { goalId: id },
      orderBy: { createdAt: "desc" },
      select: { totalDeposited: true },
    });

    const refundedAmount = goal.initialAmount.plus(
      deposit?.totalDeposited ?? 0,
    );

    const updateBalance = await adjustBalanceWithTx({
      tx,
      userId,
      amount: Number(refundedAmount),
      type: "INCREMENT",
      reason: "GOAL_DELETED",
    });

    await tx.financialGoal.update({
      where: { id, userId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      refundedAmount,
      newBalance: updateBalance.balance,
    };
  });
}
