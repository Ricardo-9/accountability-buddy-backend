import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { createVariableExpenseService } from "../../../../../src/modules/finance/variable-expenses/services/createVariableExpense.service";
import { variableExpenseRepository } from "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository";

const mockVariableExpense = {
  id: "expenseId",
  name: "expense",
  amount: new Prisma.Decimal(100.45),
  expenseDate: new Date(),
  updatedAt: new Date(),
  category: {
    id: "categoryId",
    name: "FOOD",
  },
};

vi.mock(
  "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository",
);

describe("create variable expense service test", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should create the variable expense and return it", async () => {
    vi.mocked(variableExpenseRepository.create).mockResolvedValue(
      mockVariableExpense,
    );

    const result = await createVariableExpenseService("userId", {
      name: "expense",
      amount: 100.45,
      expenseDate: new Date(),
    });

    expect(result).toEqual(mockVariableExpense);
  });

  it("should throw INVALID_REFERENCE when category is not found", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Foreign key",
      { code: "P2003", clientVersion: "test" },
    );

    vi.mocked(variableExpenseRepository.create).mockRejectedValue(prismaError);

    await expect(
      createVariableExpenseService("userId", {
        name: "expense",
        amount: 100.45,
        expenseDate: new Date(),
      }),
    ).rejects.toMatchObject({
      code: "INVALID_REFERENCE",
      message: "Category not found",
      statusCode: 404,
    });
  });
});
