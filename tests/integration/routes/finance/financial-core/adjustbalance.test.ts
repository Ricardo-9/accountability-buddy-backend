import { describe, it, expect, vi, beforeEach } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests"
import { prisma } from "../../../../../src/lib/prisma";
import { Prisma } from "@prisma/client";
import request from "supertest"
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock("jose", async (importOriginal) => {
    const original = await importOriginal<typeof import("jose")>()

    return {
        ...original,
        createRemoteJWKSet: vi.fn(),
        jwtVerify: vi.fn().mockResolvedValue({
            payload: { sub: "userId", email: "user@test.com" }
        })
    }
})

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        userArea: {
            findFirst: vi.fn()
        },
        $transaction: vi.fn(),
        financeAccount: {
            findUnique: vi.fn(),
            update: vi.fn()
        },
        financeBalanceHistory: {
            create: vi.fn()
        }
    }
}))

const validToken = "valid-token"

const updatedAt = new Date()
const mockAccount = {
    id: "acc-id",
    userId: "userId",
    balance: new Prisma.Decimal(1000),
    updatedAt
}

describe("PATCH /accounts/balance", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId: "userId" } as any)
        vi.mocked(prisma.$transaction).mockResolvedValue(mockAccount)
    })

    authMiddlewareTests("patch", "/finance/accounts/balance", "FINANCES")

    it("should return 200 and updated account (INCREMENT)", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 500, type: "INCREMENT", reason: "INCOME" })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            data: {
                accountId: "acc-id",
                ownerId: "userId",
                balance: "1000",
                updatedAt: updatedAt.toISOString()
            }
        })
        expect(prisma.$transaction).toHaveBeenCalledOnce()
    })

    it("should return 200 and updated account if amount is not integer", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue({...mockAccount, balance: new Prisma.Decimal(1000.50)})
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 500.5, type: "INCREMENT", reason: "INCOME" })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            data: {
                accountId: "acc-id",
                ownerId: "userId",
                balance: "1000.5",
                updatedAt: updatedAt.toISOString()
            }
        })
        expect(prisma.$transaction).toHaveBeenCalledOnce()
    })

    it("should return 200 and updated account (DECREMENT)", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue({ ...mockAccount, balance: new Prisma.Decimal(500) })

        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 500, type: "DECREMENT", reason: "EXPENSE" })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            data: {
                accountId: "acc-id",
                ownerId: "userId",
                balance: "500",
                updatedAt: updatedAt.toISOString()
            }
        })
        expect(prisma.$transaction).toHaveBeenCalledOnce()
    })

    it("should throw 400 if amount is missing", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ type: "DECREMENT", reason: "EXPENSE" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Amount is required")
    })

    it("should throw 400 if amount is not a number", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: "1000", type: "DECREMENT", reason: "EXPENSE" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Amount must be a number")
    })

    it("should throw 400 if amount is 0 or negative", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 0, type: "DECREMENT", reason: "EXPENSE" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("The amount value must be greater than $0")
    })

    it("should throw 400 if type is missing", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10, reason: "EXPENSE" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Type of transaction is required")
    })

    it("should throw 400 if type is invalid", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10, type: "Invalid type", reason: "EXPENSE" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Unknown transaction type")
    })

    it("should throw 400 if reason is missing", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10, type: "INCREMENT" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Reason of transaction is required")
    })

    it("should throw 400 if reason is invalid", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10, type: "INCREMENT", reason: "Invalid reason" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Unknown transaction reason")
    })

    it("should throw 400 if type and reason are incompatible (INCREMENT + EXPENSE)", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10, type: "INCREMENT", reason: "EXPENSE" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Type and reason for the transaction are not compatible")
    })

    it("should throw 400 if type and reason are incompatible (DECREMENT + INCOME)", async () => {
        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10, type: "DECREMENT", reason: "INCOME" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Type and reason for the transaction are not compatible")
    })

    it("should throw 404 if account is not found", async () => {
        vi.mocked(prisma.$transaction).mockRejectedValueOnce(new AppError("NOT_FOUND", "Finance account not found", 404))

        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10, type: "INCREMENT", reason: "INCOME" })

        expect(response.status).toBe(404)
    })

    it("should throw 400 if amount is greater than current balance", async () => {
        vi.mocked(prisma.$transaction).mockRejectedValueOnce(new AppError("INSUFFICIENT_FUNDS", "Insufficient balance", 422))

        const response = await request(app)
            .patch("/finance/accounts/balance")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ amount: 10000, type: "DECREMENT", reason: "EXPENSE" })

        expect(response.status).toBe(422)
    })

})