import { AccountabilityArea, PrismaClient } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";

export const userAreasRepository = {
    async findAreas (id: string) {
        return await prisma.userArea.findMany({
            where: { userId: id },
            select: {
                area: true
            },
            orderBy: {
                area: "asc"
            }
        })
    },

    async replaceUserAreas (id: string, areas: AccountabilityArea[]) {
        const [, createdAreas] = await prisma.$transaction([
            prisma.userArea.deleteMany({
                where: { userId: id }
            }),
            prisma.userArea.createManyAndReturn({
                data: areas.map((area) => ({
                    userId: id,
                    area
                })),
                select: {
                    area: true
                },
                skipDuplicates: true
            })
        ])

        return createdAreas
    }
}