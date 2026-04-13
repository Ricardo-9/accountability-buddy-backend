import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeRecurringTransactionService } from "../../../../../src/modules/finance/services/executeRecurringTransaction.service";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/repositories/recurringTransaction.repository";
import { financeAccountRepository } from "../../../../../src/modules/finance/repositories/financeAccount.repository";
import { Prisma } from "@prisma/client";
import { calculateNextOccurrence } from "../../../../../src/modules/finance/helpers/calculateNextOccurrence.helper";

vi.mock("../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper")
vi.mock("../../../../../src/modules/finance/repositories/recurringTransaction.repository")
vi.mock("../../../../../src/modules/finance/repositories/financeAccount.repository")
vi.mock("../../../../../src/modules/finance/helpers/calculateNextOccurrence.helper")

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn((cb) => cb({}))
    }
}))

const now = new Date()

const mockTransaction = {
    id: "transactionId",
    userId: "userId",
    amount: new Prisma.Decimal(100),
    type: "INCOME",
    nextOccurrence: new Date(now.getTime() - 10000),
    recurrenceUnit: "DAY",
    recurrenceValue: 1
}

describe("Execute recurring transaction service test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should execute one pending transaction", async () => {
        vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(mockTransaction as any)
        vi.mocked(financeAccountRepository.getAccountBalance).mockResolvedValue({ balance: new Prisma.Decimal(1000) })
        vi.mocked(calculateNextOccurrence).mockReturnValue(new Date(now.getTime() + 10000))

        await executeRecurringTransactionService("transactionId")

        expect(adjustBalanceWithTx).toHaveBeenCalledWith({
            tx: expect.anything(),
            userId: "userId",
            amount: 100,
            type: "INCREMENT",
            reason: "INCOME"
        })
        expect(recurringTransactionRepository.createTransactionExecution).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                transactionId: "transactionId"
            })
        )
        expect(recurringTransactionRepository.updateNextOccurrence).toHaveBeenCalledWith(
            expect.anything(),
            "transactionId",
            {
                lastExecutedAt: expect.any(Date),
                nextOccurrence: expect.any(Date)
            }
        )
    })

    it("should do nothing if transaction does not exist", async () => {
        vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(null)

        await executeRecurringTransactionService("transactionId")

        expect(adjustBalanceWithTx).not.toHaveBeenCalled()
        expect(recurringTransactionRepository.createTransactionExecution).not.toHaveBeenCalled()
        expect(recurringTransactionRepository.updateNextOccurrence).not.toHaveBeenCalled()
    })

    it("should execute multiple times if multiple occurrences are pending", async () => {
        vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(mockTransaction as any)
        vi.mocked(financeAccountRepository.getAccountBalance).mockResolvedValue({ balance: new Prisma.Decimal(1000) })
        vi.mocked(calculateNextOccurrence)
            .mockImplementationOnce(() => new Date(now.getTime() - 5000))
            .mockImplementationOnce(() => new Date(now.getTime() + 10000))

        await executeRecurringTransactionService("transactionId")

        expect(recurringTransactionRepository.createTransactionExecution).toHaveBeenCalledTimes(2)
    })

    it("should increment balance for income", async () => {
        vi.mocked(recurringTransactionRepository.findById).mockResolvedValue(mockTransaction as any)
        vi.mocked(financeAccountRepository.getAccountBalance).mockResolvedValue({ balance: new Prisma.Decimal(1000) })
        vi.mocked(calculateNextOccurrence).mockReturnValue(new Date(now.getTime() + 10000))

        await executeRecurringTransactionService("transactionId")

        const call = vi.mocked(recurringTransactionRepository.createTransactionExecution).mock.calls[0][1]
        expect(call.balanceBefore.toNumber()).toBe(1000)
        expect(call.balanceAfter.toNumber()).toBe(1100)
    })

    it("should decrement balance for expense", async () => {
        vi.mocked(recurringTransactionRepository.findById).mockResolvedValue({ ...mockTransaction, type: "EXPENSE" } as any)
        vi.mocked(financeAccountRepository.getAccountBalance).mockResolvedValue({ balance: new Prisma.Decimal(1000) })
        vi.mocked(calculateNextOccurrence).mockReturnValue(new Date(now.getTime() + 10000))

        await executeRecurringTransactionService("transactionId")

        const call = vi.mocked(recurringTransactionRepository.createTransactionExecution).mock.calls[0][1]
        expect(call.balanceBefore.toNumber()).toBe(1000)
        expect(call.balanceAfter.toNumber()).toBe(900)
    })
})