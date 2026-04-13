import nodeCron from "node-cron";
import { prisma } from "../../../../lib/prisma.js";
import { executeRecurringTransactionService } from "../services/executeRecurringTransaction.service.js";
import { recurringTransactionRepository } from "../../recurring-transactions/repositories/recurringTransaction.repository.js";

export function executeRecurringTransactionJob() {
  nodeCron.schedule("* * * * *", async () => {
    console.log("[Recurring Transaction Job] running...");

    const transactions =
      await recurringTransactionRepository.findPendingTransactions(prisma);

    for (const transaction of transactions) {
      try {
        await executeRecurringTransactionService(transaction.id);
      } catch (err) {
        console.error(`[Error processing transaction ${transaction.id}]`, err);
      }
    }
  });
}
