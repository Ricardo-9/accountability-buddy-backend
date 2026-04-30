import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { getOneRecurringTransactionService } from "../../../../../src/modules/finance/recurring-transactions/services/getOneRecurringTransaction.service.js";
import { Prisma } from "@prisma/client";

const mockRecurringDb = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  name: "Netflix",
  amount: new Prisma.Decimal(39.9),
  recurrenceValue: 1,
  recurrenceUnit: "MONTH",
  nextOccurrence: new Date("2025-05-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  categoryId: null,
  type: "EXPENSE",
  dayOfMonth: 1,
};

const mockRecurringResponse = {
  ...mockRecurringDb,
  amount: "39.9",
  nextOccurrence: mockRecurringDb.nextOccurrence.toISOString(),
  updatedAt: mockRecurringDb.updatedAt.toISOString(),
};

let requireAreaShouldFail = false;
let requireFinancialAccountShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/recurring-transactions/services/getOneRecurringTransaction.service.js",
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

describe("get one recurring transaction integration test", () => {
  it("should return the recurring transaction for the user", async () => {
    vi.mocked(getOneRecurringTransactionService).mockResolvedValue(
      mockRecurringDb,
    );

    const response = await request(app).get(
      "/finance/transactions/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.body.data).toEqual({
      recurringTransaction: mockRecurringResponse,
    });

    expect(response.status).toBe(200);
  });

  it("should return 400 when id is not uuid", async () => {
    const response = await request(app).get(
      "/finance/transactions/123",
    );

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(
      async (_req, _res, next) => {
        next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
      },
    );

    const response = await request(app).get(
      "/finance/transactions/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(401);
  });

  it("should return 403 when no area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app).get(
      "/finance/transactions/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(403);
  });

  it("should return 404 when no financial account", async () => {
    requireFinancialAccountShouldFail = true;

    const response = await request(app).get(
      "/finance/transactions/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("User account not found");
  });

  it("should return 404 when recurring not found", async () => {
    vi.mocked(getOneRecurringTransactionService).mockRejectedValue(
      new AppError("NOT_FOUND", "Recurring transaction not found", 404),
    );

    const response = await request(app).get(
      "/finance/transactions/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe(
      "Recurring transaction not found",
    );
  });

  it("should return 500 when unexpected error happens", async () => {
    vi.mocked(getOneRecurringTransactionService).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app).get(
      "/finance/transactions/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(500);
  });
});