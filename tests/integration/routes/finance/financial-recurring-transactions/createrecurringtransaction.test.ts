import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import { Prisma } from "@prisma/client";
import request from "supertest"
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
        userArea: { findFirst: vi.fn() },
        recurringTransaction: { create: vi.fn() },
        financeAccount: { findUnique: vi.fn() },
        financialCategory: { findFirst: vi.fn() }
    }
}))

const validToken = "validToken"

const firstOccurrence = "2026-05-08"
const nextOccurrence = `${firstOccurrence}T00:00:00`
const createdAt = "2026-04-09T12:18:22.718Z"

const mockTransaction = {
    type: "INCOME",
    name: "Transaction name",
    amount: 1000,
    recurrenceValue: 15,
    recurrenceUnit: "DAY",
    firstOccurrence,
    dayOfMonth: null,
    categoryId: null
}

const mockDbValue = {
    id: "c027e992-9e54-4f2b-b131-e34e427cca58",
    userId: "userId",
    categoryId: null,
    type: "INCOME",
    name: "Transaction name",
    amount: new Prisma.Decimal(1000),
    recurrenceValue: 15,
    recurrenceUnit: "DAY",
    dayOfMonth: null,
    createdAt,
    nextOccurrence
}

const expectedResponse = {
    ...mockDbValue,
    amount: "1000"
}

describe("POST /transactions", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({ id: "accId" } as any)
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId: "userId" } as any)
    })

    authMiddlewareTests("post", "/finance/transactions", "FINANCES")

    describe("Happy path", () => {
        it("should return 201 and transaction data when both categoryId and dayOfMonth are null", async () => {
            vi.mocked(prisma.recurringTransaction.create).mockResolvedValue(mockDbValue as any)

            const response = await request(app)
                .post("/finance/transactions")
                .set("Authorization", `Bearer ${validToken}`)
                .send(mockTransaction)

            expect(response.status).toBe(201)
            expect(response.body.data).toEqual(expectedResponse)
        })

        it("should return 201 and transaction data when categoryId is not null and valid", async () => {
            const categoryId = "83793157-f162-490c-b503-ea5983ab04b7"

            vi.mocked(prisma.recurringTransaction.create).mockResolvedValue({ ...mockDbValue, categoryId } as any)
            vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue({ id: categoryId } as any)

            const response = await request(app)
                .post("/finance/transactions")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ ...mockTransaction, categoryId })

            expect(response.status).toBe(201)
            expect(response.body.data).toEqual({ ...expectedResponse, categoryId })
        })

        it("should return 201 and transaction data when dayOfMonth is not null and valid", async () => {
            vi.mocked(prisma.recurringTransaction.create).mockResolvedValue({
                ...mockDbValue,
                recurrenceUnit: "MONTH",
                dayOfMonth: 8
            } as any)

            const response = await request(app)
                .post("/finance/transactions")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ ...mockTransaction, recurrenceUnit: "MONTH", dayOfMonth: 8 })

            expect(response.status).toBe(201)
            expect(response.body.data).toEqual({ ...expectedResponse, recurrenceUnit: "MONTH", dayOfMonth: 8 })
        })
    })

    describe("API errors", () => {
        it("should throw 404 if categoryId is not null but invalid", async () => {
            const categoryId = "83793157-f162-490c-b503-ea5983ab04b7"

            vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue(null)

            const response = await request(app)
                .post("/finance/transactions")
                .set("Authorization", `Bearer ${validToken}`)
                .send({ ...mockTransaction, categoryId })

            expect(response.status).toBe(404)
            expect(response.body.error).toMatchObject({
                code: "NOT_FOUND",
                message: "Category not found"
            })
        })

        it("should throw 404 if user account is not found", async () => {
            vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null)

            const response = await request(app)
                .post("/finance/transactions")
                .set("Authorization", `Bearer ${validToken}`)
                .send(mockTransaction)

            expect(response.status).toBe(404)
            expect(response.body.error).toMatchObject({
                code: "NOT_FOUND",
                message: "User account not found"
            })
        })

        it("should throw 500 if database fails", async () => {
            vi.mocked(prisma.recurringTransaction.create).mockRejectedValue(new Error("Db error"))

            const response = await request(app)
                .post("/finance/transactions")
                .set("Authorization", `Bearer ${validToken}`)
                .send(mockTransaction)

            expect(response.status).toBe(500)
        })
    })

    describe("Zod validation", () => {
        describe("Missing fields", () => {
            it("should throw 400 if type is missing", async () => {
                const { type, ...object } = mockTransaction

                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(object)

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Transaction type is required")
            })

            it("should throw 400 if name is missing", async () => {
                const { name, ...object } = mockTransaction

                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(object)

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Name is required")
            })

            it("should throw 400 if amount is missing", async () => {
                const { amount, ...object } = mockTransaction

                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(object)

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Amount is required")
            })

            it("should throw 400 if recurrenceValue is missing", async () => {
                const { recurrenceValue, ...object } = mockTransaction

                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(object)

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Recurrence value is required")
            })

            it("should throw 400 if recurrenceUnit is missing", async () => {
                const { recurrenceUnit, ...object } = mockTransaction

                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(object)

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Recurrence unit is required")
            })

            it("should throw 400 if firstOccurrence is missing", async () => {
                const { firstOccurrence, ...object } = mockTransaction

                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send(object)

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("First occurrence date is required")
            })
        })

        describe("Type errors", () => {
            it("should throw 400 if the type of type is incorrect", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, type: "not-valid" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Invalid transaction type")
            })

            it("should throw 400 if the type of name is incorrect", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, name: 123 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Name must be a string")
            })

            it("should throw 400 if the type of amount is incorrect", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, amount: "not-valid" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Amount must be a number")
            })

            it("should throw 400 if the type of recurrenceValue is incorrect (not a number)", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceValue: "not-valid" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Recurrence value must be a number")
            })

            it("should throw 400 if the type of recurrenceValue is incorrect (not an integer)", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceValue: 1.4 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Recurrence value must be an integer")
            })

            it("should throw 400 if the type of recurrenceUnit is incorrect", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceUnit: "not-valid" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Invalid recurrence unit")
            })

            it("should throw 400 if the type of firstOccurrence is incorrect", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, firstOccurrence: "not-valid" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Expected format: YYYY-MM-DD")
            })

            it("should throw 400 if the type of categoryId is incorrect", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, categoryId: "not-valid" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Invalid category id")
            })

            it("should throw 400 if the type of dayOfMonth is incorrect (not a number)", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceUnit: "MONTH", dayOfMonth: "not-valid" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Invalid day of month")
            })

            it("should throw 400 if the type of dayOfMonth is incorrect (not an integer)", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceUnit: "MONTH", dayOfMonth: 10.5 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Day of month must be an integer")
            })
        })

        describe("Value errors", () => {
            it("should throw 400 if amount <= 0", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, amount: 0 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Amount value must be greater than $0")
            })

            it("should throw 400 if recurrenceValue < 1", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceValue: 0 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Recurrence value must be at least 1")
            })

            it("should throw 400 if dayOfMonth <= 0", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, dayOfMonth: 0 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Day of month must be greater than 0")
            })

            it("should throw 400 if dayOfMonth > 31", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, dayOfMonth: 32 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Day of month cannot be greater than 31")
            })
        })

        describe("Refine errors", () => {
            it("should throw 400 if firstOccurrence is in the past", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, firstOccurrence: "2025-04-08" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("First ocurrence cannot be in the past")
            })

            it("should throw 400 if dayOfMonth is not provided when recurrenceUnit = MONTH", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceUnit: "MONTH" })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("Day of month is required for monthly recurrence")
            })

            it("should throw 400 if first ocurrence don't match dayOfMonth", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceUnit: "MONTH", firstOccurrence: "2026-05-09", dayOfMonth: 5 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("First occurrence must match day of month")
            })

            it("should throw 400 if dayOfMonth is provided when recurrenceUnit = DAY", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceUnit: "DAY", dayOfMonth: 5 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("dayOfMonth should not be provided for daily or weekly recurrence")
            })

            it("should throw 400 if dayOfMonth is provided when recurrenceUnit = WEEK", async () => {
                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, recurrenceUnit: "WEEK", dayOfMonth: 5 })

                expect(response.status).toBe(400)
                expect(response.body.error.details[0].message).toBe("dayOfMonth should not be provided for daily or weekly recurrence")
            })
        })

        describe("Transform values", () => {
            it("should transform firstOcurrence", async () => {
                vi.mocked(prisma.recurringTransaction.create).mockResolvedValue({ id: "rec-id" } as any)

                const response = await request(app)
                    .post("/finance/transactions")
                    .set("Authorization", `Bearer ${validToken}`)
                    .send({ ...mockTransaction, firstOccurrence: "2026-12-25" })

                expect(response.status).toBe(201)
                expect(prisma.recurringTransaction.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            nextOccurrence: new Date("2026-12-25T00:00:00")
                        })
                    })
                )
            })
        })
    })
})