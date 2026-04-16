import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import { financeAccountRepository } from "../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository";
import { Prisma } from "@prisma/client";
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError";
import request from "supertest"

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
    userArea: {
      findFirst: vi.fn(),
    }
  },
}));

let userHaveAccount: boolean

vi.mock("../../../../../src/modules/finance/middlewares/requireFinancialAccount", () => ({
  requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
    if (!userHaveAccount) {
      return next(new AppError("NOT_FOUND", "User account not found", 404))
    }
    next()
  })
}))

vi.mock("../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository")

const validToken = "valid-token";

const createdAt = new Date();
const updatedAt = new Date();

const mockAccount = {
  id: "acc-id",
  userId: "userId",
  balance: new Prisma.Decimal(1000),
  createdAt,
  updatedAt,
};

describe("GET /accounts test", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId: "userId" } as any)
    userHaveAccount = true
  });

  authMiddlewareTests("post", "/finance/accounts", "FINANCES");

  it("should return 200 and account data", async () => {
    vi.mocked(financeAccountRepository.getAccount).mockResolvedValue(mockAccount);

    const response = await request(app)
      .get("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        accountId: "acc-id",
        ownerId: "userId",
        balance: "1000",
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  });


  it("should throw 404 (NOT_FOUND) if user does not have an account", async () => {
    userHaveAccount = false

    const response = await request(app)
      .get("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("User account not found");
  });

  it("should throw 500 for server errors", async () => {
    vi.mocked(financeAccountRepository.getAccount).mockRejectedValue(new Error("Db error"));

    const response = await request(app)
      .get("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(500);
  })
});
