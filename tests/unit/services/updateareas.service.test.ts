import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "../../../src/lib/prisma"
import { updateAreasService } from "../../../src/modules/user/areas/services/updateareas.service"

vi.mock("../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
        userArea: {
            deleteMany: vi.fn(),
            createManyAndReturn: vi.fn()
        }
    }
}))

describe("Update user areas test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should return an array with the provided arguments", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue([
            {},
            [{ area: "GYM" }, { area: "FINANCES" }]
        ])

        const result = await updateAreasService("userId", ["GYM", "FINANCES"])

        expect(prisma.$transaction).toHaveBeenCalledOnce()
        expect(result).toEqual(["GYM", "FINANCES"])
    })

    it("should call $transaction with deleteMany and createManyAndReturn", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue([
            {},
            [{ area: "GYM" }]
        ])

        await updateAreasService("userId", ["GYM"])

        expect(prisma.$transaction).toHaveBeenCalledOnce()

        const args = vi.mocked(prisma.$transaction).mock.calls[0][0]
        expect(args).toHaveLength(2)
    })

    it("should delete areas with the correct userId", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue([
            {},
            [{ area: "GYM" }]
        ])

        await updateAreasService("userId", ["GYM"])

        expect(prisma.userArea.deleteMany).toHaveBeenCalledWith({
            where: { userId: "userId" }
        })
    })

    it("should create areas with the correct areas and userId", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue([
            {},
            [{ area: "GYM" }, { area: "FINANCES" }]
        ])

        await updateAreasService("userId", ["GYM", "FINANCES"])

        expect(prisma.userArea.createManyAndReturn).toHaveBeenCalledWith({
            data: [
                { userId: "userId", area: "GYM" },
                { userId: "userId", area: "FINANCES" }
            ],
            select: { area: true },
            skipDuplicates: true
        })
    })
})