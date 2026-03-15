import { describe, beforeEach, vi, expect, it } from "vitest"
import { prisma } from "../../../src/lib/prisma"
import request from "supertest"
import app from "../../../src/app"
import { jwtVerify } from "jose"

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

vi.mock("../../../src/lib/prisma", () => ({
    prisma: {
        userArea: {
            findMany: vi.fn(),
            deleteMany: vi.fn(),
            createManyAndReturn: vi.fn()
        },
        $transaction: vi.fn()
    }
}))

const validToken = "valid-token"

describe("User area routes", () => {
    beforeEach(() => vi.clearAllMocks())

    describe("GET /areas", () => {
        it("should return 200 and the user areas", async () => {
            vi.mocked(prisma.userArea.findMany).mockResolvedValue([
                { area: "GYM" },
                { area: "FINANCES" }
            ] as any)
            const response = await request(app)
                .get("/user/areas")
                .set("Authorization", `Bearer ${validToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                success: true,
                data: ["GYM", "FINANCES"]
            })
        })

        it("should return 200 and an empty array when the user has no areas", async () => {
            vi.mocked(prisma.userArea.findMany).mockResolvedValue([])

            const response = await request(app)
                .get("/user/areas")
                .set("Authorization", `Bearer ${validToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                success: true,
                data: []
            })
        })

        it("should return 401 when token is invalid", async () => {
            vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("Invalid token"))

            const response = await request(app)
                .get("/user/areas")
                .set("Authorization", "Bearer invalid-token")

            expect(response.status).toBe(401)
        })

        it("should return 401 when no token is provided", async () => {
            const response = await request(app).get("/user/areas")

            expect(response.status).toBe(401)
        })
    })
})