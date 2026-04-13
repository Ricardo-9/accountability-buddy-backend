import { DurationUnit, InvestorStyle, Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";

export async function updateGoalService(
  id: string,
  userId: string,
  categoryId?: string | null,
  name?: string,
  target?: number,
  initialAmount?: number,
  durationValue?: number,
  durationUnit?: DurationUnit,
  style?: InvestorStyle,
) {
  return await prisma.$transaction(async (tx) => {
    const existingGoal = await tx.financialGoal.findUnique({
      where: { id, userId, deletedAt: null },
      select: {
        target: true,
        initialAmount: true,
      },
    });

    if (!existingGoal)
      throw new AppError("NOT_FOUND", "Financial goal not found", 404);

    if (categoryId) {
      const category = await tx.financialCategory.findUnique({
        where: { id: categoryId, userId },
        select: { id: true },
      });

      if (!category) throw new AppError("NOT_FOUND", "Category not found", 404);
    }

    const finalTarget =
      target !== undefined ? new Prisma.Decimal(target) : existingGoal.target;
    const finalAmount =
      initialAmount !== undefined
        ? new Prisma.Decimal(initialAmount)
        : existingGoal.initialAmount;

    if (finalAmount.gt(finalTarget))
      throw new AppError(
        "INVALID_AMOUNT",
        "Initial amount cannot be greater than target",
      );

    const updatedGoal = await tx.financialGoal.update({
      where: { id, userId },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(name !== undefined && { name }),
        ...(target !== undefined && { target: finalTarget }),
        ...(initialAmount !== undefined && { initialAmount: finalAmount }),
        ...(durationValue !== undefined && { durationValue }),
        ...(durationUnit !== undefined && { durationUnit }),
        ...(style !== undefined && { style }),
      },
    });

    let updatedBalance;

    if (
      initialAmount !== undefined &&
      !finalAmount.equals(existingGoal.initialAmount)
    ) {
      const difference = finalAmount.minus(existingGoal.initialAmount);
      const type = difference.gt(0) ? "DECREMENT" : "INCREMENT";
      const amount = Math.abs(Number(difference));

      updatedBalance = await adjustBalanceWithTx({
        tx,
        userId,
        amount,
        type,
        reason: "GOAL_UPDATE",
      });
    }

    return {
      updatedGoal,
      ...(updatedBalance && { newBalance: updatedBalance.balance }),
    };
  });
}
