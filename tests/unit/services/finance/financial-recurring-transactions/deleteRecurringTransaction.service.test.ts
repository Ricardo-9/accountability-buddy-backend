import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteRecurringTransactionService } from "../../../../../src/modules/finance/recurring-transactions/services/deleteRecurringTransaction.service";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";

vi.mock("../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository")

describe("Delete recurring transaction service test", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should delete a recurring transaction by id", async () => {
    vi.mocked(recurringTransactionRepository.deleteRecurringTransaction).mockResolvedValue({
      count: 1,
    });

    const result = await deleteRecurringTransactionService(
      "transactionId",
      "userId",
    );

    expect(recurringTransactionRepository.deleteRecurringTransaction).toHaveBeenCalledWith(expect.anything(), "userId", "transactionId")
    expect(result).toBeUndefined();
  });

  it("should throw error if transaction does not exist", async () => {
    vi.mocked(recurringTransactionRepository.deleteRecurringTransaction).mockResolvedValue({
      count: 0,
    });

    await expect(
      deleteRecurringTransactionService("transactionId", "userId"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Transaction not found",
      statusCode: 404,
    });
  });
});
