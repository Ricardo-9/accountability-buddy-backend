import { describe, expect, it, vi, beforeEach } from "vitest";
import { getOneRecurringTransactionService } from "../../../../../src/modules/finance/recurring-transactions/services/getOneRecurringTransaction.service";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";

const mockRecurring = {
  id: "recurringId",
  name: "Netflix",
  amount: 39.9,
};

vi.mock(
  "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository",
);

describe("get one recurring transaction service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return recurring transaction", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(
      mockRecurring as any,
    );

    const result = await getOneRecurringTransactionService(
      "user-123",
      "recurringId",
    );

    expect(result).toEqual(mockRecurring);
  });

  it("should throw NOT_FOUND when not exists", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(null);

    await expect(
      getOneRecurringTransactionService("user-123", "recurringId"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "Recurring transaction not found",
    });
  });

  it("should propagate repository errors", async () => {
    vi.mocked(recurringTransactionRepository.findById).mockRejectedValue(
      new Error("Database failed"),
    );

    await expect(
      getOneRecurringTransactionService("user-123", "recurringId"),
    ).rejects.toThrow("Database failed");
  });
});