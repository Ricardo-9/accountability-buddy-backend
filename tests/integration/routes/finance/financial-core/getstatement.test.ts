import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest"
import app from "../../../../../src/app";
import { FinanceBalanceHistory } from "@prisma/client";

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
        financeBalanceHistory: {
            findMany: vi.fn()
        },
        userArea: {
            findFirst: vi.fn()
        }
    }
}))

const validToken = "valid-token"

const mockStatement = [
    {
        id: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
        balance: 2004000,
        change: -1000,
        type: "EXPENSE",
        createdAt: "2026-03-26T16:08:07.955Z"
    },
    {
        id: "8a7455df-2b3a-4405-ab3b-df29b2fec44d",
        balance: 2005000,
        change: 5000,
        type: "INCOME",
        createdAt: "2026-03-25T14:27:56.998Z"
    },
    {
        id: "5ddd7449-d063-495a-af5b-c0561c511009",
        balance: 2000000,
        change: 2000000,
        type: "INITIAL_BALANCE",
        createdAt: "2026-03-24T12:36:35.332Z"
    }
] as unknown as FinanceBalanceHistory[]

describe("GET /accounts/statement", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId: "userId" } as any)
        vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({ id: "accId" } as any)
        vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)
    })

    authMiddlewareTests("get", "/finance/accounts/statement", "FINANCES")

    it("should return 200 and user statement", async () => {
        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.data).toEqual(mockStatement)
        expect(response.body.data.nextCursor).toBe(mockStatement[mockStatement.length - 1].id)
    })

    it("should filter by start date", async () => {
        const startDate = "2026-03-25"

        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ startDate })

        expect(response.status).toBe(200)
        expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    createdAt: {
                        gte: new Date(startDate)
                    }
                })
            })
        )
    })

    it("should filter by end date", async () => {
        const endDate = "2026-03-25"

        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ endDate })

        expect(response.status).toBe(200)
        expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    createdAt: {
                        lte: new Date(endDate)
                    }
                })
            })
        )
    })

    it("should filter by start date and end date", async () => {
        const startDate = "2026-03-24"
        const endDate = "2026-03-26"

        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ startDate, endDate })

        expect(response.status).toBe(200)
        expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                })
            })
        )
    })

    it("should apply limit", async () => {
        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ limit: 10 })

        expect(response.status).toBe(200)
        expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 10
            })
        )
    })

    it("should apply cursor pagination", async () => {
        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ cursor: "5ddd7449-d063-495a-af5b-c0561c511009" })

        expect(response.status).toBe(200)
        expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 1,
                cursor: { id: "5ddd7449-d063-495a-af5b-c0561c511009" }
            })
        )
    })

    it("should throw 400 when startDate is invalid", async () => {
        vi.clearAllMocks()

        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ startDate: "not-a-valid-date" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Invalid start date")
    })

    it("should throw 400 when endDate is invalid", async () => {
        vi.clearAllMocks()

        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ endDate: "not-a-valid-date" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Invalid end date")
    })

    it("should throw 400 when endDate is before startDate", async () => {
        vi.clearAllMocks()

        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ startDate: "2026-03-30", endDate: "2026-03-20" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Start date must be before end date")
    })

    it("should throw 400 when limit <= 0", async () => {
        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ limit: 0 })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Limit must be at least 1")
    })

    it("should throw 400 when limit > 100", async () => {
        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ limit: 1000 })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Limit must be at most 100")
    })

    it("should throw 400 when cursor is not valid", async () => {
        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)
            .query({ cursor: "not-a-valid-cursor" })

        expect(response.status).toBe(400)
        expect(response.body.error.details[0].message).toBe("Invalid cursor")
    })

    it("should throw 404 when account is not found", async () => {
        vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null)

        const response = await request(app)
            .get("/finance/accounts/statement")
            .set("Authorization", `Bearer ${validToken}`)

        expect(response.status).toBe(404)
    })
})