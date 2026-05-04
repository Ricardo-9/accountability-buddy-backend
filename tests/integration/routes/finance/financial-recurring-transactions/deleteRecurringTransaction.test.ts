import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest";
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";

vi.mock("jose", async (importOriginal) => {
  const original = await importOriginal<typeof import("jose")>();

  return {
    ...original,
    createRemoteJWKSet: vi.fn(),
    jwtVerify: vi.fn().mockResolvedValue({
      payload: { sub: "userId", email: "user@test.com" },
    }),
  };
});

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    userArea: { findFirst: vi.fn() }
  },
}));

vi.mock("../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository")

let userHaveAccount: boolean

vi.mock("../../../../../src/modules/finance/middlewares/requireFinancialAccount", () => ({
  requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
    if (!userHaveAccount) {
      return next(new AppError("NOT_FOUND", "User account not found", 404))
    }
    next()
  })
}))

const validToken = "validToken";

const transactionId = "83793157-f162-490c-b503-ea5983ab04b7";

describe("DELETE /transactions/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({
      userId: "userId",
    } as any);
    userHaveAccount = true
  });

  authMiddlewareTests(
    "delete",
    `/finance/transactions/${transactionId}`,
    "FINANCES",
  );

  it("should return 200 and delete the recurring transaction", async () => {
    vi.mocked(recurringTransactionRepository.deleteRecurringTransaction).mockResolvedValue({
      count: 1,
    });

    const response = await request(app)
      .delete(`/finance/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
  });

  it("should return 404 if recurring transaction is not found", async () => {
    vi.mocked(recurringTransactionRepository.deleteRecurringTransaction).mockResolvedValue({
      count: 0,
    });

    const response = await request(app)
      .delete(`/finance/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
      message: "Transaction not found",
    });
  });

  it("should throw 404 if user account is not found", async () => {
    userHaveAccount = false

    const response = await request(app)
      .delete(`/finance/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
      message: "User account not found",
    });
  });

  it("should throw 400 if id is invalid", async () => {
    const response = await request(app)
      .delete(`/finance/transactions/invalid`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].message).toBe("Invalid id");
  });

  it("should throw 500 if db fails", async () => {
    vi.mocked(recurringTransactionRepository.deleteRecurringTransaction).mockRejectedValue(
      new Error("Db error"),
    );

    const response = await request(app)
      .delete(`/finance/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(500);
  });
});
