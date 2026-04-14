import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest";
import { Prisma } from "@prisma/client";
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { createFinancialAccountService } from "../../../../../src/modules/finance/financial-core/services/createFinancialAccount.service";

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
      findFirst: vi.fn()
    }
  }
}))

vi.mock("../../../../../src/modules/finance/financial-core/services/createFinancialAccount.service")

const validToken = "valid-token";

const createdAt = new Date();
const mockAccount = {
  id: "acc-id",
  userId: "userId",
  balance: new Prisma.Decimal(1000),
  createdAt,
  updatedAt: new Date(),
};

describe("POST /accounts test", async () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId: "userId" } as any)
  });

  authMiddlewareTests("post", "/finance/accounts", "FINANCES");

  it("should return 201 and account data", async () => {
    vi.mocked(createFinancialAccountService).mockResolvedValue(mockAccount)

    const response = await request(app)
      .post("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ balance: 1000 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      data: {
        accountId: "acc-id",
        ownerId: "userId",
        balance: "1000",
        createdAt: createdAt.toISOString(),
      },
    });
  });

  it("should create account when balance = 0", async () => {
    vi.mocked(createFinancialAccountService).mockResolvedValue(
      { ...mockAccount, balance: new Prisma.Decimal(0) },
    );

    const response = await request(app)
      .post("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ balance: 0 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      data: {
        accountId: "acc-id",
        ownerId: "userId",
        balance: "0",
        createdAt: createdAt.toISOString(),
      },
    });
  });


  it("should throw error 400 (VALIDATION_ERROR) if balance is missing", async () => {
    const response = await request(app)
      .post("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].message).toBe("Balance is required");
  });

  it("should throw error 400 (VALIDATION_ERROR) if balance is not a number", async () => {
    const response = await request(app)
      .post("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ balance: "not a number" });

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].message).toBe(
      "Balance must be a number",
    );
  });

  it("should throw error 400 (VALIDATION_ERROR) if balance < 0", async () => {
    const response = await request(app)
      .post("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ balance: -500 });

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].message).toBe(
      "The minimum balance value is $0",
    );
  });

  it("should throw error 409 (DUPLICATE_REGISTER) if user already has an account", async () => {
    vi.mocked(createFinancialAccountService).mockRejectedValue(
      new AppError(
        "DUPLICATE_REGISTER",
        "User already has an account",
        409
      )
    );

    const response = await request(app)
      .post("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ balance: 1000 });

    expect(response.status).toBe(409);
    expect(response.body.error.message).toBe("User already has an account");
  });

  it("should throw 500 for server errors", async () => {
    vi.mocked(createFinancialAccountService).mockRejectedValue(new Error("Db error"));

    const response = await request(app)
      .post("/finance/accounts")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ balance: 1000 });

    expect(response.status).toBe(500);
  })
}); 
