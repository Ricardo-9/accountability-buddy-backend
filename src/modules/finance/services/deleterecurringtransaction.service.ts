import { AppError } from "../../../core/errors/AppError.js";
import { prisma } from "../../../lib/prisma.js";

export async function deleteRecurringTransactionService(id: string, userId: string) {
    const deletedTransaction = await prisma.recurringTransaction.update({
        where: { id, userId, deletedAt: null },
        data: { deletedAt: new Date() }
    })

    if (!deletedTransaction) throw new AppError ("NOT_FOUND", "Transaction not found", 404)
}