import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { AccountabilityArea, Prisma } from "@prisma/client";

export async function insertAreaService(
    id: string,
    area: AccountabilityArea
) {
    try {
        const newArea = await prisma.userArea.create({
            data: {
                userId: id,
                area
            },
            select: {
                area: true
            }
        })

        return newArea
    }
    catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError && 
            err.code === "P2002"
        ) {
            throw new AppError(
                "DUPLICATE_REGISTER",
                "User already is signed up for this area",
                400
            )
        }

        throw err
    }
}