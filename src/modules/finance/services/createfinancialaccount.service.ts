import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "../../../lib/prisma.js";
import { AppError } from "../../../core/errors/AppError.js";

export async function createFinancialAccountService(
    userId: string,
    balance: number
) {
    try {
        const [account] = await prisma.$transaction([
            prisma.financeAccount.create({
                data: {
                    userId,
                    balance
                },
                select: {
                    id: true,
                    userId: true,
                    balance: true,
                    createdAt: true
                }
            }),
            prisma.financeBalanceHistory.create({
                data: {
                    userId,
                    balance,
                    change: balance,
                    type: "INITIAL_BALANCE"
                }
            })
        ])

        return account
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002")
            throw new AppError("DUPLICATE_REGISTER", "The user already has an account", 409)

        throw err
    }
}