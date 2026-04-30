import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateRecurringTransactionService } from "../../../../../src/modules/finance/recurring-transactions/services/updateRecurringTransaction.service";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";
import { financialCategoriesRepository } from "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";

vi.mock("../../../../../src/lib/prisma.js", () => ({
  prisma: {
    $transaction: vi.fn(async (callback) => callback({})),
  },
}));

vi.mock(
  "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository",
);

vi.mock(
  "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository",
);

const mockExisting = {
  id: "recurringId",
  type: "EXPENSE",
  name: "Netflix",
  amount: {
    toNumber: () => 39.9,
  },
  recurrenceValue: 1,
  recurrenceUnit: "MONTH",
  categoryId: null,
  dayOfMonth: 1,
  nextOccurrence: new Date("2099-05-01"),
};

describe("update recurring transaction service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update recurring transaction", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(
      mockExisting as any,
    );

    vi.mocked(
      recurringTransactionRepository.updateRecurringTransaction,
    ).mockResolvedValue({
      ...mockExisting,
      name: "Updated",
    } as any);

    const result = await updateRecurringTransactionService(
      "recurringId",
      "user-123",
      {
        name: "Updated",
      },
    );

    expect(result).toEqual({
      ...mockExisting,
      name: "Updated",
    });
  });

  it("should throw NOT_FOUND when recurring does not exist", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(null);

    await expect(
      updateRecurringTransactionService("id", "user", {}),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "Recurring transaction not found",
    });
  });

  it("should throw error when category not found", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(
      mockExisting as any,
    );

    vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
      null,
    );

    await expect(
      updateRecurringTransactionService("id", "user", {
        categoryId: "category-id",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "Category not found",
    });
  });

  it("should throw error when dayOfMonth used with non-month recurrence", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockResolvedValue({
      ...mockExisting,
      recurrenceUnit: "DAY",
    } as any);

    await expect(
      updateRecurringTransactionService("id", "user", {
        dayOfMonth: 10,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_DATA",
      statusCode: 400,
      message: "dayOfMonth only allowed for monthly recurrence",
    });
  });

  it("should throw error when nextOccurrence is in the past", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(
      mockExisting as any,
    );

    await expect(
      updateRecurringTransactionService("id", "user", {
        firstOccurrence: new Date("2000-01-01"),
      }),
    ).rejects.toMatchObject({
      code: "INVALID_DATA",
      statusCode: 400,
      message: "Next occurrence cannot be in the past",
    });
  });

  it("should propagate repository errors", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockRejectedValue(
      new Error("DB fail"),
    );

    await expect(
      updateRecurringTransactionService("id", "user", {}),
    ).rejects.toThrow("DB fail");
  });
});