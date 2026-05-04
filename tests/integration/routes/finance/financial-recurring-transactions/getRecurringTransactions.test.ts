import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma, TransactionType, RecurrenceUnit } from "@prisma/client";
import { getRecurringTransactionService } from "../../../../../src/modules/finance/recurring-transactions/services/getRecurringTransaction.service.js";

const mockDb = {
  id: "recurring-id",
  userId: "user-123",
  categoryId: null,
  type: TransactionType.EXPENSE,
  name: "Spotify",
  amount: new Prisma.Decimal(19.9),
  recurrenceValue: 1,
  recurrenceUnit: RecurrenceUnit.MONTH,
  dayOfMonth: 5,
  nextOccurrence: new Date("2025-05-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockResponse = {
  ...mockDb,
  amount: "19.9",
  nextOccurrence: mockDb.nextOccurrence.toISOString(),
  updatedAt: mockDb.updatedAt.toISOString(),
};

let requireAreaShouldFail = false;
let requireFinancialAccountShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/recurring-transactions/services/getRecurringTransaction.service.js",
);

vi.mock("../../../../../src/middlewares/authMiddleware.js", () => ({
  authenticate: vi.fn(async (req: any, _res, next) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

vi.mock("../../../../../src/middlewares/requireArea.js", () => ({
  requireArea: vi.fn(() => async (_req: any, _res: any, next: any) => {
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
    requireFinancialAccount: vi.fn(
      async (_req: any, _res: any, next: any) => {
        if (requireFinancialAccountShouldFail) {
          return next(
            new AppError("NOT_FOUND", "User account not found", 404),
          );
        }
        next();
      },
    ),
  }),
);

beforeEach(() => {
  vi.clearAllMocks();
  requireAreaShouldFail = false;
  requireFinancialAccountShouldFail = false;
});

describe("get recurring transactions integration", () => {
  it("should return recurring transactions successfully", async () => {
    vi.mocked(getRecurringTransactionService).mockResolvedValue([mockDb]);

    const response = await request(app).get(
      "/finance/transactions",
    );

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      recurringTransactions: [mockResponse],
      nextCursor: null,
    });
  });

  it("should return paginated result with nextCursor", async () => {
    vi.mocked(getRecurringTransactionService).mockResolvedValue([
      mockDb,
      { ...mockDb, id: "cursor-id" },
    ] as any);

    const response = await request(app)
      .get("/finance/transactions")
      .query({ limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data.nextCursor).toBe(mockDb.id);
  });

  it("should filter by type", async () => {
    vi.mocked(getRecurringTransactionService).mockResolvedValue([]);

    const response = await request(app).get(
      "/finance/transactions?type=EXPENSE",
    );

    expect(response.status).toBe(200);
  });

  it("should filter by categoryId", async () => {
    vi.mocked(getRecurringTransactionService).mockResolvedValue([]);

    const response = await request(app).get(
      "/finance/transactions?categoryId=3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(200);
  });

  it("should filter by date range", async () => {
    vi.mocked(getRecurringTransactionService).mockResolvedValue([]);

    const response = await request(app).get(
      "/finance/transactions?startDate=2025-01-01&endDate=2025-02-01",
    );

    expect(response.status).toBe(200);

    expect(getRecurringTransactionService).toHaveBeenCalledWith(
      "user-123",
      10,
      undefined,
      undefined,
      undefined,
      new Date("2025-01-01"),
      new Date("2025-02-01"),
    );
  });

  it("should return 400 when startDate > endDate", async () => {
    const response = await request(app).get(
      "/finance/transactions?startDate=2025-02-01&endDate=2025-01-01",
    );

    expect(response.status).toBe(400);
  });

  it("should return 400 when invalid categoryId", async () => {
    const response = await request(app).get(
      "/finance/transactions?categoryId=123",
    );

    expect(response.status).toBe(400);
  });

  it("should return 400 when invalid cursor", async () => {
    const response = await request(app).get(
      "/finance/transactions?cursor=123",
    );

    expect(response.status).toBe(400);
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(
      async (_req, _res, next) => {
        next(new AppError("UNAUTHORIZED", "Invalid token", 401));
      },
    );

    const response = await request(app).get(
      "/finance/transactions",
    );

    expect(response.status).toBe(401);
  });

  it("should return 403 when no area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app).get(
      "/finance/transactions",
    );

    expect(response.status).toBe(403);
  });

  it("should return 404 when no financial account", async () => {
    requireFinancialAccountShouldFail = true;

    const response = await request(app).get(
      "/finance/transactions",
    );

    expect(response.status).toBe(404);
  });

  it("should return 500 when service fails", async () => {
    vi.mocked(getRecurringTransactionService).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app).get(
      "/finance/transactions",
    );

    expect(response.status).toBe(500);
  });
});