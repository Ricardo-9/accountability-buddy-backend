import nodeCron from "node-cron";
import { prisma } from "../../../lib/prisma.js";
import { executeRecurringTransactionService } from "../services/executeRecurringTransaction.service.js";

export function executeRecurringTransactionJob() {
    nodeCron.schedule("* * * * *", async () => {
        console.log("[Recurring Transaction Job] running...")

        const now = new Date()

        const transactions = await prisma.recurringTransaction.findMany({
            where: {
                nextOccurrence: {
                    lte: now
                },
                deletedAt: null
            },
            select: {
                id: true
            }
        })

        for (const transaction of transactions) {
            try {
                await executeRecurringTransactionService(transaction.id)
            } catch (err) {
                console.error(`[Error processing transaction ${transaction.id}]`, err)
            }
        }
    })
}