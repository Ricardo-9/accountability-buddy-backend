import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { Prisma } from "@prisma/client";
import { updateGoalService } from "../../../../../src/modules/finance/financial-goals/services/updateGoal.service";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper";
import { ensureCategoryExists } from "../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper";
import { financialGoalsRepository } from "../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

const mockTx = {
  financialGoal: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  financialCategory: {
    findFirst: vi.fn(),
  },
};

vi.mock(
  "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper",
);

vi.mock("../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper")

vi.mock("../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository")

const userId = "userId";
const goalId = "goalId";

describe("Update financial goals service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
      fn(mockTx),
    );
    vi.mocked(ensureCategoryExists).mockResolvedValue(undefined)
  });

  it("should update goal without change balance when initial amount is not provided", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    const result = await updateGoalService(
      goalId,
      userId,
      undefined,
      "New name",
    );

    expect(result.updatedGoal).toBeDefined();

    expect(financialGoalsRepository.getUniqueGoal).toHaveBeenCalledWith(mockTx, goalId, userId, { target: true, initialAmount: true })
    expect(adjustBalanceWithTx).not.toHaveBeenCalled();
  });

  it("should decrement balance when initial amount increases", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    await updateGoalService(
      goalId,
      userId,
      undefined,
      undefined,
      undefined,
      30,
    );

    expect(adjustBalanceWithTx).toHaveBeenCalledWith({
      tx: mockTx,
      userId,
      amount: 10,
      type: "DECREMENT",
      reason: "GOAL_UPDATE",
    });
  });

  it("should increment balance when initial amount decreases", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    await updateGoalService(
      goalId,
      userId,
      undefined,
      undefined,
      undefined,
      10,
    );

    expect(adjustBalanceWithTx).toHaveBeenCalledWith({
      tx: mockTx,
      userId,
      amount: 10,
      type: "INCREMENT",
      reason: "GOAL_UPDATE",
    });
  });

  it("should not adjust balance when initial amount is unchanged", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    await updateGoalService(
      goalId,
      userId,
      undefined,
      undefined,
      undefined,
      20,
    );

    expect(adjustBalanceWithTx).not.toHaveBeenCalled();
  });

  it("should throw if goal does not exist", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue(null);

    await expect(updateGoalService(goalId, userId)).rejects.toThrow(
      "Financial goal not found",
    );
  });

  it("should throw when initial amount is greater than target", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    await expect(
      updateGoalService(goalId, userId, undefined, undefined, undefined, 200),
    ).rejects.toThrow("Initial amount cannot be greater than target");
  });

  it("should throw when updating target below initial amount", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    await expect(
      updateGoalService(goalId, userId, undefined, undefined, 19),
    ).rejects.toThrow("Initial amount cannot be greater than target");
  });

  it("should handle initial amount = 0", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    await updateGoalService(goalId, userId, undefined, undefined, undefined, 0);

    expect(adjustBalanceWithTx).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 20,
        type: "INCREMENT",
      }),
    );
  });

  it("should call ensureCategoryExists when category !== undefined", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    await updateGoalService(
      goalId,
      userId,
      "categoryId",
      "New name",
    );

    expect(ensureCategoryExists).toHaveBeenCalledWith(mockTx, userId, "categoryId")
  })

  it("should not call ensureCategoryExists when category === undefined", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    await updateGoalService(
      goalId,
      userId,
      undefined,
      "New name",
    );

    expect(ensureCategoryExists).not.toHaveBeenCalled()
  })

  it("should allow removing category (category = null)", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);

    await updateGoalService(goalId, userId, null);

    expect(financialGoalsRepository.updateGoal).toHaveBeenCalledWith(mockTx, goalId, userId,
      expect.objectContaining({
        categoryId: null
      }),
    );
  });

  it("should propagate error from adjustBalanceWithTx", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      target: new Prisma.Decimal(100),
      initialAmount: new Prisma.Decimal(20),
    });

    vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({ id: goalId } as any);
    vi.mocked(adjustBalanceWithTx).mockRejectedValue(new Error("Adjust balance helper error"))

    await expect(updateGoalService(goalId, userId, undefined, undefined, undefined, 50)).rejects.toThrow(
      "Adjust balance helper error",
    );
  })

  it("should propagate error from ensureCategoryExists", async () => {
    vi.mocked(ensureCategoryExists).mockRejectedValue(
      new Error("Ensure Category Exists Error")
    )

    await expect(updateGoalService(goalId, userId, "categoryId")).rejects.toThrow("Ensure Category Exists Error");
  })
});
