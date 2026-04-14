import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest";
import app from "../../../../../src/app";

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
    userArea: { findFirst: vi.fn() },
    recurringTransaction: { updateMany: vi.fn() },
    financeAccount: { findUnique: vi.fn() },
  },
}));

const validToken = "validToken";

const transactionId = "83793157-f162-490c-b503-ea5983ab04b7";

describe("DELETE /transactions/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({
      id: "accId",
    } as any);
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({
      userId: "userId",
    } as any);
  });

  authMiddlewareTests(
    "delete",
    `/finance/transactions/${transactionId}`,
    "FINANCES",
  );

  it("should return 200 and delete the recurring transaction", async () => {
    vi.mocked(prisma.recurringTransaction.updateMany).mockResolvedValue({
      count: 1,
    });

    const response = await request(app)
      .delete(`/finance/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
  });

  it("should return 404 if recurring transaction is not found", async () => {
    vi.mocked(prisma.recurringTransaction.updateMany).mockResolvedValue({
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
    vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null);

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
    vi.mocked(prisma.recurringTransaction.updateMany).mockRejectedValue(
      new Error("Db error"),
    );

    const response = await request(app)
      .delete(`/finance/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(500);
  });
});
