import { prisma } from "../../../../lib/prisma.js";

export async function getAreasService(id: string) {
    const areas = await prisma.userArea.findMany({
        where: { userId: id },
        select: {
            area: true
        },
        orderBy: {
            area: "asc"
        }
    })

    return areas.map(a => a.area)
}