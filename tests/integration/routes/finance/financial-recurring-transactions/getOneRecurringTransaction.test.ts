import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma } from "@prisma/client";
import { getOneRecurringTransactionService } from "../../../../../src/modules/finance/services/getonerecurringtransaction.service.js";

const mockRecurringTransaction = {
  id: "3f8642d3-806a-49d2-b365-3149ef1bd0ed",
  userId: "ca87bf22-7747-446c-9ff0-a95065152d80",
  categoryId: "cat-789",
  type: "EXPENSE" as const,
  name: "Netflix Subscription",
  amount: new Prisma.Decimal(49.9),
  recurrenceValue: 1,
  recurrenceUnit: "MONTH" as const,
  dayOfMonth: 15,
  createdAt: new Date("2026-01-15"),
  nextOccurrence: new Date("2026-05-15"),
  lastExecutedAt: null,
  updatedAt: new Date("2026-01-15"),
};

const expectedHttpResponse = {
  id: "3f8642d3-806a-49d2-b365-3149ef1bd0ed",
  userId: "ca87bf22-7747-446c-9ff0-a95065152d80",
  categoryId: "cat-789",
  type: "EXPENSE",
  name: "Netflix Subscription",
  amount: "49.9",
  recurrenceValue: 1,
  recurrenceUnit: "MONTH",
  dayOfMonth: 15,
  createdAt: "2026-01-15T00:00:00.000Z",
  nextOccurrence: "2026-05-15T00:00:00.000Z",
  lastExecutedAt: null,
  updatedAt: "2026-01-15T00:00:00.000Z",
};

let requireAreaShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/services/getonerecurringtransaction.service.js",
);

vi.mock("../../../../../src/middlewares/authMiddleware.ts", () => ({
  authenticate: vi.fn((req: any, _res, next) => {
    req.user = { id: "ca87bf22-7747-446c-9ff0-a95065152d80" };
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
    requireFinancialAccount: vi.fn((req: any, _res: any, next: any) => {
      req.financialAccount = {
        id: "account-123",
        userId: "ca87bf22-7747-446c-9ff0-a95065152d80",
        balance: new Prisma.Decimal(1000),
      };
      next();
    }),
  }),
);

beforeEach(() => {
  vi.clearAllMocks();
  requireAreaShouldFail = false;
});

describe("get recurring transaction (one)", () => {
  it("should return 200 and the transaction", async () => {
    vi.mocked(getOneRecurringTransactionService).mockResolvedValue(
      mockRecurringTransaction,
    );

    const response = await request(app).get(
      "/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed",
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expectedHttpResponse);
    expect(response.body.error).toBeUndefined();
  });

  it("should return 400 when id is no uuid", async () => {
    const response = await request(app).get("/finance/transactions/invalid-id");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).get(
      "/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed",
    );

    expect(response.status).toBe(401);
  });
  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app).get(
      "/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed",
    );

    expect(response.status).toBe(403);
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(getOneRecurringTransactionService).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app).get(
      "/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed",
    );

    expect(response.status).toBe(500);
  });
});
