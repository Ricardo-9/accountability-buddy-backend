import { describe, it, vi, expect, beforeEach } from "vitest";
import { createRecurringTransactionService } from "../../../../../src/modules/finance/recurring-transactions/services/createRecurringTransaction.service";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";
import { ensureCategoryExists } from "../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper";
import { RecurrenceUnit, TransactionType } from "@prisma/client";

vi.mock("../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository", () => ({
  recurringTransactionRepository: {
    createRecurringTransaction: vi.fn()
  }
}))

vi.mock("../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper", () => ({
  ensureCategoryExists: vi.fn()
}))

const mockTransaction = {
  type: TransactionType.INCOME,
  name: "Transaction name",
  amount: 1000,
  recurrenceValue: 15,
  recurrenceUnit: RecurrenceUnit.DAY,
  firstOccurrence: new Date(),
  dayOfMonth: null,
  categoryId: null,
};

describe("Create recurring transaction service test", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should call repository with mapped nextOccurrence", async () => {
    vi.mocked(recurringTransactionRepository.createRecurringTransaction).mockResolvedValue({ id: "id" })

    const result = await createRecurringTransactionService("userId", mockTransaction)

    expect(recurringTransactionRepository.createRecurringTransaction).toHaveBeenCalledWith(
      expect.anything(),
      "userId",
      expect.objectContaining({
        nextOccurrence: mockTransaction.firstOccurrence
      })
    )

    expect(result).toEqual({ id: "id" })
  })

  it("should call ensureCategoryExists when categoryId is provided", async () => {
    await createRecurringTransactionService("userId", { ...mockTransaction, categoryId: "categoryId" })

    expect(ensureCategoryExists).toHaveBeenCalledWith(expect.anything(), "userId", "categoryId")
  })

  it("should not call ensureCategoryExists when categoryId is null", async () => {
    await createRecurringTransactionService("userId", mockTransaction)

    expect(ensureCategoryExists).not.toHaveBeenCalled()
  })
})