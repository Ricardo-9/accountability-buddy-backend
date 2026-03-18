import { AccountabilityArea } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";

export async function updateAreasService(
    id: string,
    areas: AccountabilityArea[]
) {
    const [, createdAreas] = await prisma.$transaction([
        prisma.userArea.deleteMany({
            where: { userId: id }
        }),
        prisma.userArea.createManyAndReturn({
            data: areas.map(area => ({
                userId: id,
                area
            })),
            select: {
                area: true
            },
            skipDuplicates: true
        })
    ])

    return createdAreas.map(a => a.area)
}