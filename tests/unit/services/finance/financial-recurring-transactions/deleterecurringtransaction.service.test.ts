import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { deleteRecurringTransactionService } from "../../../../../src/modules/finance/services/deleterecurringtransaction.service";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    recurringTransaction: {
      updateMany: vi.fn(),
    },
  },
}));

describe("Delete recurring transaction service test", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should delete a recurring transaction by id", async () => {
    vi.mocked(prisma.recurringTransaction.updateMany).mockResolvedValue({
      count: 1,
    });

    const result = await deleteRecurringTransactionService(
      "transactionId",
      "userId",
    );

    expect(prisma.recurringTransaction.updateMany).toHaveBeenCalledWith({
      where: { id: "transactionId", userId: "userId", deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
    expect(result).toBeUndefined();
  });

  it("should throw error if transaction does not exist", async () => {
    vi.mocked(prisma.recurringTransaction.updateMany).mockResolvedValue({
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
