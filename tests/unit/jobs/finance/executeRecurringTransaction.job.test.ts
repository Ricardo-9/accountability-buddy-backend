import nodeCron from "node-cron";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { executeRecurringTransactionJob } from "../../../../src/modules/finance/jobs/executeRecurringTransaction.job";
import { recurringTransactionRepository } from "../../../../src/modules/finance/repositories/recurringTransaction.repository";
import { executeRecurringTransactionService } from "../../../../src/modules/finance/services/executeRecurringTransaction.service";

vi.mock("node-cron", () => ({
    default: {
        schedule: vi.fn()
    }
}))

vi.mock("../../../../src/modules/finance/repositories/recurringTransaction.repository")
vi.mock("../../../../src/modules/finance/services/executeRecurringTransaction.service")

describe("Execute recurring transaction job test", () => {
    beforeEach(() => vi.clearAllMocks())
    it("should process all pending transactions", async () => {
        const fakeCallback = vi.fn()

        vi.mocked(nodeCron.schedule).mockImplementation((expression: any, cb: any) => {
            fakeCallback.mockImplementation(cb as any)

            return {
                start: vi.fn(),
                stop: vi.fn()
            } as any
        })

        vi.mocked(recurringTransactionRepository.findPendingTransactions).mockResolvedValue([
            { id: "1" },
            { id: "2" }
        ])

        executeRecurringTransactionJob()

        await fakeCallback()

        expect(executeRecurringTransactionService).toHaveBeenCalledTimes(2)
        expect(executeRecurringTransactionService).toHaveBeenCalledWith("1")
        expect(executeRecurringTransactionService).toHaveBeenCalledWith("2")
        expect(nodeCron.schedule).toHaveBeenCalledWith("* * * * *", expect.any(Function))
    })
})

