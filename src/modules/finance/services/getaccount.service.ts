import { prisma } from "../../../lib/prisma.js";

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

    return account
}