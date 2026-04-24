import { describe, it, expect, vi, beforeEach } from "vitest";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper";
import { createGoalService } from "../../../../../src/modules/finance/financial-goals/services/createGoal.service";
import {
  DurationUnit,
  FinanceAccount,
  InvestorStyle,
  Prisma,
} from "@prisma/client";
import { financialGoalsRepository } from "../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository";
import { ensureCategoryExists } from "../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper";
import { prisma } from "../../../../../src/lib/prisma";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository")

vi.mock(
  "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper",
);

vi.mock("../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper")

const txMock = {
  financialGoal: {
    create: vi.fn(),
  }
};

const adjustBalanceWithTxMock = vi.mocked(adjustBalanceWithTx);

const mockGoal = {
  id: "goalId",
  userId: "userId",
  name: "goalName",
  target: new Prisma.Decimal(1000),
  initialAmount: new Prisma.Decimal(100),
  durationValue: 12,
  durationUnit: DurationUnit.MONTHS,
  style: InvestorStyle.LOW,
  categoryId: "categoryId",
  createdAt: new Date(),
};

describe("Create financial goal service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) =>
      fn(txMock as any),
    );
    vi.mocked(ensureCategoryExists).mockResolvedValue(undefined)
    adjustBalanceWithTxMock.mockResolvedValue({
      balance: new Prisma.Decimal(100),
    } as unknown as FinanceAccount);
  });

  it("should create goal with category and return goal data and new balance", async () => {
    vi.mocked(financialGoalsRepository.createGoal).mockResolvedValue(mockGoal)

    const result = await createGoalService(
      "userId",
      "goalName",
      1000,
      100,
      12,
      "MONTHS",
      "LOW",
      "categoryId",
    );

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function))
    expect(ensureCategoryExists).toHaveBeenCalledWith(txMock, "userId", "categoryId")
    expect(result).toEqual({
      goal: mockGoal,
      newBalance: new Prisma.Decimal(100),
    });
  });

  it("should create goal without category and return goal data and new balance", async () => {
    vi.mocked(financialGoalsRepository.createGoal).mockResolvedValue({ ...mockGoal, categoryId: null })

    const result = await createGoalService(
      "userId",
      "goalName",
      1000,
      100,
      12,
      "MONTHS",
      "LOW",
      null,
    );

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function))
    expect(ensureCategoryExists).toHaveBeenCalledWith(txMock, "userId", null)
    expect(result).toEqual({
      goal: { ...mockGoal, categoryId: null },
      newBalance: new Prisma.Decimal(100),
    });
  });

  it("should call repository with correct params", async () => {
    vi.mocked(financialGoalsRepository.createGoal).mockResolvedValue(mockGoal)

    await createGoalService(
      "userId",
      "goalName",
      1000,
      100,
      12,
      "MONTHS",
      "LOW",
      "categoryId",
    );

    expect(financialGoalsRepository.createGoal).toHaveBeenCalledWith(
      txMock, {
        userId: "userId",
        name: "goalName",
        target: 1000,
        initialAmount: 100,
        durationValue: 12,
        durationUnit: "MONTHS",
        style: "LOW",
        categoryId: "categoryId"
      }
    )
  })

  it("should call adjustBalanceWithTx with correct params", async () => {
    vi.mocked(financialGoalsRepository.createGoal).mockResolvedValue(mockGoal)

    await createGoalService(
      "userId",
      "goalName",
      1000,
      100,
      12,
      "MONTHS",
      "LOW",
      "categoryId",
    );

    expect(adjustBalanceWithTx).toHaveBeenCalledWith({
      tx: txMock,
      userId: "userId",
      amount: 100,
      type: "DECREMENT",
      reason: "GOAL_CREATE",
    });
  });

  it("should propagate error from adjustBalanceWithTx", async () => {
    vi.mocked(financialGoalsRepository.createGoal).mockResolvedValue(mockGoal)
    adjustBalanceWithTxMock.mockRejectedValue(
      new Error("Adjust Balance Error"),
    );

    await expect(
      createGoalService(
        "userId",
        "goalName",
        1000,
        100,
        12,
        "MONTHS",
        "LOW",
        "categoryId",
      ),
    ).rejects.toThrow("Adjust Balance Error");
  });

  it("should propagate error from ensureCategoryExists", async () => {
    vi.mocked(ensureCategoryExists).mockRejectedValue(
      new Error("Ensure Category Exists Error")
    )

    await expect(
      createGoalService(
        "userId",
        "goalName",
        1000,
        100,
        12,
        "MONTHS",
        "LOW",
        "categoryId",
      ),
    ).rejects.toThrow("Ensure Category Exists Error");
  })
}); 
