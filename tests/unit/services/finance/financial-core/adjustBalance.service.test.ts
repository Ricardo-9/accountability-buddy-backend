import { describe, it, expect, vi } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { adjustBalanceService } from "../../../../../src/modules/finance/financial-core/services/adjustBalance.service";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe("Adjust balance service test", () => {
  it("should execute adjustBalanceWithTx inside a transaction", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue({ id: "accId" })

    await adjustBalanceService("userId", 10, "INCREMENT", "INCOME")

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function))
  })
})