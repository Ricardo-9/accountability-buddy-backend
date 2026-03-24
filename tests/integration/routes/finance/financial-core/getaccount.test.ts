import { describe, it, expect, beforeEach, vi } from "vitest";
import { jwtVerify } from "jose";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest"
import { Prisma } from "@prisma/client";
import app from "../../../../../src/app";

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
        financeAccount: {
            findUnique: vi.fn()
        },
        userArea: {
            findFirst: vi.fn()
        }
    }
}))

const validToken = "valid-token"

const createdAt = new Date()
const updatedAt = new Date()

const mockAccount = {
    id: "acc-id",
    userId: "userId",
    balance: new Prisma.Decimal(1000),
    createdAt,
    updatedAt
}

describe("GET /accounts test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should return 200 and account data", async () => {
        vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(mockAccount)
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId: "userId" } as any)

        const response = await request(app)
            .get("/finance/accounts")
            .set("Authorization", `Bearer ${validToken}`)

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            data: {
                accountId: "acc-id",
                ownerId: "userId",
                balance: "1000",
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString()
            }
        })
    })

    it("should throw error 401 (UNAUTHORIZED) if token is missing", async () => {
        const response = await request(app).get("/finance/accounts")

        expect(response.status).toBe(401)
    })

    it("should throw error 401 (UNAUTHORIZED) if token is invalid", async () => {
        vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("Invalid token"))

        const response = await request(app)
            .get("/finance/accounts")
            .set("Authorization", "Bearer invalid-token")

        expect(response.status).toBe(401)
    })

    it("should throw error 403 (FORBIDDEN) if user is not registered in FINANCES", async () => {
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue(null)

        const response = await request(app)
            .get("/finance/accounts")
            .set("Authorization", `Bearer ${validToken}`)

        expect(response.status).toBe(403)
    })

    it("should throw error 404 (NOT_FOUND) if user does not have an account", async () => {
        vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId: "userId" } as any)

        const response = await request(app)
            .get("/finance/accounts")
            .set("Authorization", `Bearer ${validToken}`)

        expect(response.status).toBe(404)
        expect(response.body.error.message).toBe("User does not have an account")
    })
})