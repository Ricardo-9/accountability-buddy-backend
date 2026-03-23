import { prisma } from "../../../lib/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";

export async function getAccountService(userId: string) {
    const account = await prisma.financeAccount.findUnique({
        where: { userId },
        select: {
            id: true,
            userId: true,
            balance: true,
            createdAt: true,
            updatedAt: true
        }
    })

    if(!account) throw new AppError("NONEXISTENT_ACCOUNT", "User does not have an account", 404)

    return account
}