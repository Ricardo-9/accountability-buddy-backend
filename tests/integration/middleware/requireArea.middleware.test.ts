import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../src/lib/prisma";
import { Request, Response, NextFunction } from "express";
import { AccountabilityArea } from "@prisma/client";
import { requireArea } from "../../../src/middlewares/requireArea";
import { AppError } from "../../../src/core/errors/AppError";

vi.mock("../../../src/lib/prisma", () => ({
    prisma: {
        userArea: {
            findFirst: vi.fn()
        }
    }
}))

describe("Require area middleware test", () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: ReturnType<typeof vi.fn>

    const mockArea = {
        id: "area-id",
        userId: "random-id",
        area: AccountabilityArea.FINANCES,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    beforeEach(() => {
        req = {
            user: { id: "random-id" }
        } as unknown as Request
        res = {}
        next = vi.fn()
        vi.clearAllMocks()
    })

    it("should call next() when the user is registered in the required area", async () => {
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue(mockArea)

        const middleware = requireArea(AccountabilityArea.FINANCES)
        await middleware(req as Request, res as Response, next as NextFunction)

        expect(prisma.userArea.findFirst).toHaveBeenCalledWith({
            where: {
                userId: "random-id",
                area: AccountabilityArea.FINANCES
            },
            select: { userId: true }
        })

        expect(next).toHaveBeenCalledWith()
    })

    it("should call next(AppError) with 403 (FORBIDDEN) when the user is not registered in the required area", async () => {
        vi.mocked(prisma.userArea.findFirst).mockResolvedValue(null)

        const middleware = requireArea(AccountabilityArea.FINANCES)
        await middleware(req as Request, res as Response, next as NextFunction)

        expect(next).toHaveBeenCalledWith(expect.any(AppError))

        const error = vi.mocked(next).mock.calls[0][0] as AppError
        expect(error.statusCode).toBe(403)
        expect(error.code).toBe("FORBIDDEN")
    })
})