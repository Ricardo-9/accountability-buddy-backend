import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app";
import { prisma } from "../../../../../src/lib/prisma.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma } from "@prisma/client";
import { updateRecurringTransactionService } from "../../../../../src/modules/finance/services/updaterecurringtransaction.service";

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

const expectedHttpResponseArray = {
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

vi.mock(
  "../../../../../src/modules/finance/services/updaterecurringtransaction.service",
);

vi.mock("../../../../../src/middlewares/authMiddleware.ts", () => ({
  authenticate: vi.fn((req: any, _res, next) => {
    req.user = { id: "ca87bf22-7747-446c-9ff0-a95065152d80" };
    next();
  }),
}));

let requireAreaShouldFail = false;

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

describe("update recurring transaction", () => {
  it("should return 200 and update the recurring transaction", async () => {
    vi.mocked(updateRecurringTransactionService).mockResolvedValue({
      ...mockRecurringTransaction,
      name: "New Name",
    });

    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({ name: "New Name" });

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      ...expectedHttpResponseArray,
      name: "New Name",
    });

    expect(response.body.error).toBeUndefined();
  });

  it("should return 400 when body is invalid", async () => {
    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({
        amount: -10,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 400 when id is invalid uuid", async () => {
    const response = await request(app)
      .patch("/finance/transactions/invalid-id")
      .send({
        name: "New Name",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(
      async (_req, _res, next) => {
        next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
      },
    );

    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({
        name: "New Name",
      });

    expect(response.status).toBe(401);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({
        name: "New Name",
      });

    expect(response.status).toBe(403);
  });

  it("should return 404 when route id is missing", async () => {
    const response = await request(app)
      .patch("/finance/transactions")
      .send({
        name: "New Name",
      });

    expect(response.status).toBe(404);
  });

  it("should return 404 when recurring transaction not found", async () => {
    vi.mocked(updateRecurringTransactionService).mockRejectedValue(
      new AppError(
        "NOT_FOUND",
        "Recurring transaction not found",
        404,
      ),
    );

    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({
        name: "New Name",
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("should return 400 when invalid recurrence rule", async () => {
    vi.mocked(updateRecurringTransactionService).mockRejectedValue(
      new AppError(
        "INVALID_DATA",
        "dayOfMonth only allowed for monthly recurrence",
        400,
      ),
    );

    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({
        dayOfMonth: 15,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_DATA");
  });

  it("should return 400 when next occurrence is in the past", async () => {
    vi.mocked(updateRecurringTransactionService).mockRejectedValue(
      new AppError(
        "INVALID_DATA",
        "Next occurrence cannot be in the past",
        400,
      ),
    );

    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({
        firstOccurrence: "2008-01-01",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_DATA");
  });

  it("should return 500 when unexpected error happens", async () => {
    vi.mocked(updateRecurringTransactionService).mockRejectedValue(
      new Error("Database exploded"),
    );

    const response = await request(app)
      .patch("/finance/transactions/3f8642d3-806a-49d2-b365-3149ef1bd0ed")
      .send({
        name: "New Name",
      });

    expect(response.status).toBe(500);
  });
});
