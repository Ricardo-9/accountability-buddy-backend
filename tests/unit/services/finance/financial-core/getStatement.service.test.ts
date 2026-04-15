import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStatementService } from "../../../../../src/modules/finance/financial-core/services/getStatement.service";
import { FinanceBalanceHistory } from "@prisma/client";
import { financeAccountRepository } from "../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository";

vi.mock("../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository")

const mockStatement = [
  { id: "stt1" },
  { id: "stt2" },
  { id: "stt3" }
] as unknown as FinanceBalanceHistory[];

describe("Get statement service test", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return full statement when no next page", async () => {
    vi.mocked(financeAccountRepository.getStatement).mockResolvedValue(
      mockStatement,
    );

    const result = await getStatementService("random-id", 3);

    expect(result).toEqual({
      statement: mockStatement,
      nextCursor: null
    });
  });

  it("should remove extra item and return nextCursor", async () => {
    vi.mocked(financeAccountRepository.getStatement).mockResolvedValue(
      mockStatement,
    );

    const result = await getStatementService("random-id", 2);

    expect(result).toEqual({
      statement: [
        { id: "stt1" },
        { id: "stt2" }
      ],
      nextCursor: "stt2"
    });
  });

  it("should call repository with correct params", async () => {
    vi.mocked(financeAccountRepository.getStatement).mockResolvedValue([])

    await getStatementService("randomId", 10, new Date("2024-01-01"), new Date("2024-01-31"), "cursor-1")

    expect(financeAccountRepository.getStatement).toHaveBeenCalledWith(
      "randomId",
      10,
      new Date("2024-01-01"),
      new Date("2024-01-31"),
      "cursor-1"
    )
  })

  it("should use default limit when no provided", async () => {
    vi.mocked(financeAccountRepository.getStatement).mockResolvedValue([])

    await getStatementService("randomId")

    expect(financeAccountRepository.getStatement).toHaveBeenCalledWith(
      "randomId",
      20,
      undefined,
      undefined,
      undefined
    )
  })
});
