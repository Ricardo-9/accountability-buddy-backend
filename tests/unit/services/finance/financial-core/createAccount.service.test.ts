import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFinancialAccountService } from "../../../../../src/modules/finance/financial-core/services/createFinancialAccount.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { financeAccountRepository } from "../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository";
import { Prisma } from "@prisma/client";

vi.mock("../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository")

function makePrismaError(code: string) {
  return new PrismaClientKnownRequestError("error", {
    code,
    clientVersion: "5.0.0",
  });
}

describe("Create financial account test", () => {
  const userId = "random-id";
  const balance = 10000;

  const mockAccount = {
    id: "account-id",
    userId,
    balance: new Prisma.Decimal(balance),
    createdAt: new Date(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("should create an account and return its data", async () => {
    vi.mocked(financeAccountRepository.createFinancialAccount).mockResolvedValueOnce(mockAccount);

    const result = await createFinancialAccountService(userId, balance);

    expect(result).toEqual(mockAccount);
  });

  it("should throw an AppError with status 409 (CONFLICT) when Prisma return error 'P2002'", async () => {
    vi.mocked(financeAccountRepository.createFinancialAccount).mockRejectedValueOnce(
      makePrismaError("P2002"),
    );

    await expect(
      createFinancialAccountService(userId, balance),
    ).rejects.toMatchObject({
      code: "DUPLICATE_REGISTER",
      statusCode: 409,
    });
  });
});
