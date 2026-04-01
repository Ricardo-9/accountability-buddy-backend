import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAccountService } from "../../../../../src/modules/finance/services/getaccount.service"
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        financeAccount: {
            findUnique: vi.fn()
        }
    }
}))

describe("Get account service test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should return the account when exists", async () => {
        const mockAccount = {
            id: "acc-id",
            userId: "random-id",
            balance: new Prisma.Decimal(100),
            createdAt: new Date(),
            updatedAt: new Date()
        }
        vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(mockAccount)

        const result = await getAccountService("random-id")

        expect(result).toEqual(mockAccount)
        expect(prisma.financeAccount.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "random-id" }
            })
        )
    })
})