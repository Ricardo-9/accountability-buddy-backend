import { DurationUnit, InvestorStyle, Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";

export async function createGoalService(
  userId: string,
  name: string,
  target: number,
  initialAmount: number,
  durationValue: number,
  durationUnit: DurationUnit,
  style: InvestorStyle,
  categoryId: string | null,
) {
  return await prisma.$transaction(async (tx) => {
    const decimalTarget = new Prisma.Decimal(target);
    const decimalAmount = new Prisma.Decimal(initialAmount);

    if (categoryId) {
      const category = await tx.financialCategory.findFirst({
        where: { id: categoryId, userId },
      });

      if (!category) throw new AppError("NOT_FOUND", "Category not found", 404);
    }

    const goal = await tx.financialGoal.create({
      data: {
        userId,
        name,
        target: decimalTarget,
        initialAmount: decimalAmount,
        durationValue,
        durationUnit,
        style,
        categoryId,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        target: true,
        initialAmount: true,
        durationValue: true,
        durationUnit: true,
        style: true,
        categoryId: true,
        createdAt: true,
      },
    });

    const newBalance = await adjustBalanceWithTx({
      tx,
      userId,
      amount: initialAmount,
      type: "DECREMENT",
      reason: "GOAL_CREATE",
    });

    return {
      goal,
      newBalance: newBalance.balance,
    };
  });
}
