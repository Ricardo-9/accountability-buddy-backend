import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { createVariableExpenseService } from "../../../../../src/modules/finance/variable-expenses/services/createVariableExpense.service";
import { AppError } from "../../../../../src/core/errors/AppError";
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
    const invalidReferenceError = new AppError(
      "INVALID_REFERENCE",
      "Category not found",
      404,
    );

    vi.mocked(variableExpenseRepository.create).mockRejectedValue(
      invalidReferenceError,
    );

    await expect(
      createVariableExpenseService("userId", {
        name: "expense",
        amount: 100.45,
        expenseDate: new Date(),
      }),
    ).rejects.toMatchObject({
      code: "INVALID_REFERENCE",
      statusCode: 404,
    });
  });

});