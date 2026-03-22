import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { createFinancialAccountService } from "../../../../../src/modules/finance/services/createfinancialaccount.service"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
        financeAccount: { create: vi.fn() },
        financeBalanceHistory: { create: vi.fn() }
    }
}))

function makePrismaError(code: string) {
    return new PrismaClientKnownRequestError("error", {
        code,
        clientVersion: "5.0.0"
    })
}

describe("Create financial account test", () => {
    const userId = "random-id"
    const balance = 10000

    const mockAccount = {
        id: "account-id",
        userId,
        balance,
        createdAt: new Date()
    }

    beforeEach(() => vi.clearAllMocks())

    it("should create an account and return its data", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValueOnce([mockAccount])

        const result = await createFinancialAccountService(userId, balance)

        expect(result).toEqual(mockAccount)
    })

    it("should call prisma transaction with financialAccount.create and financeBalanceHistory.create", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValueOnce([mockAccount])

        await createFinancialAccountService(userId, balance)

        expect(prisma.$transaction).toHaveBeenCalledOnce()

        const args = vi.mocked(prisma.$transaction).mock.calls[0][0];
        expect(args).toHaveLength(2);
    })

    it("should create financialBalanceHistory with type = INITIAL_BALANCE and change = balance", async () => {
        let captureHistoryData: any

        vi.mocked(prisma.financeBalanceHistory.create).mockImplementationOnce((args) => {
            captureHistoryData = args.data
            return {} as any
        })

        vi.mocked(prisma.$transaction).mockImplementationOnce(async (ops: any) => {
            await Promise.all(ops)
            return [mockAccount]
        })

        await createFinancialAccountService(userId, balance)

        expect(captureHistoryData).toMatchObject({
            userId,
            balance,
            change: balance,
            type: "INITIAL_BALANCE"
        })
    })

    it("should throw an AppError with status 409 (CONFLICT) when Prisma return error 'P2002'", async () => {
        vi.mocked(prisma.$transaction).mockRejectedValueOnce(makePrismaError("P2002"))

        await expect(createFinancialAccountService(userId, balance)).rejects.toMatchObject({
            code: "DUPLICATE_REGISTER",
            statusCode: 409
        })
    })
})