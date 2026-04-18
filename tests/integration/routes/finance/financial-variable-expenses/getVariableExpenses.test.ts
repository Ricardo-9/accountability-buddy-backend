import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma } from "@prisma/client";

const mockExpenseDb = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  category: null,
  name: "Random Expense",
  amount: new Prisma.Decimal(234.45),
  expenseDate: new Date("2025-04-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const mockExpenseResponse = {
  ...mockExpenseDb,
  amount: "234.45",
  expenseDate: mockExpenseDb.expenseDate.toISOString(),
  updatedAt: mockExpenseDb.updatedAt.toISOString(),
};


let requireAreaShouldFail = false;
let requireFinancialAccountShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/financial-categories/services/getOneCategory.service.js",
);

vi.mock("../../../../../src/middlewares/authMiddleware.js", () => ({
  authenticate: vi.fn((req: any, _res, next) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

vi.mock("../../../../../src/middlewares/requireArea.js", () => ({
  requireArea: vi.fn(() => (_req: any, _res: any, next: any) => {
    if (requireAreaShouldFail) {
      return next(
        new AppError(
          "FORBIDDEN",
          "User need to be registered in FINANCES to access this feature",
          403,
        ),
      );
    }
    next();
  }),
}));

vi.mock(
  "../../../../../src/modules/finance/middlewares/requireFinancialAccount.js",
  () => ({
    requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
      if (requireFinancialAccountShouldFail) {
        return next(new AppError("NOT_FOUND", "User account not found", 404));
      }
      next();
    }),
  }),
);

beforeEach(() => {
  vi.clearAllMocks();

  requireAreaShouldFail = false;
  requireFinancialAccountShouldFail = false;
});