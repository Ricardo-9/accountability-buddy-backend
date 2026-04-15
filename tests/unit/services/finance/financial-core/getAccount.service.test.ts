import { describe, it, expect, beforeEach, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { getAccountService } from "../../../../../src/modules/finance/financial-core/services/getAccount.service";
import { financeAccountRepository } from "../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository";

vi.mock("../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository")

const mockAccount = {
  id: "acc-id",
  userId: "random-id",
  balance: new Prisma.Decimal(100),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Get account service test", () => {
  beforeEach(() => vi.clearAllMocks());
  
  it("should return the account when exists", async () => {
    vi.mocked(financeAccountRepository.getAccount).mockResolvedValue(mockAccount);

    const result = await getAccountService("random-id");

    expect(result).toEqual(mockAccount);
  });
});
