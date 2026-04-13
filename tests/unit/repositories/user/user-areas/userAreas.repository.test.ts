import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { userAreasRepository } from "../../../../../src/modules/user/areas/repositories/userAreas.repository";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
        userArea: {
            findMany: vi.fn(),
            deleteMany: vi.fn(),
            createManyAndReturn: vi.fn(),
        }
    }
}))

describe("User areas repository test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should call prisma.findMany with correct params", async () => {
        vi.mocked(prisma.userArea.findMany).mockResolvedValue([] as any)

        await userAreasRepository.findAreas("userId")

        expect(prisma.userArea.findMany).toHaveBeenCalledWith({
            where: { userId: "userId" },
            select: { area: true },
            orderBy: { area: "asc" },
        })
    })

    it("should call $transaction with deleteMany and createManyAndReturn", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue([{}, [{ area: "GYM" }]]);

        await userAreasRepository.replaceUserAreas("userId", ["GYM"]);

        expect(prisma.$transaction).toHaveBeenCalledOnce();

        const args = vi.mocked(prisma.$transaction).mock.calls[0][0];
        expect(args).toHaveLength(2);
    });

    it("should delete areas with the correct userId", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue([{}, [{ area: "GYM" }]]);

        await userAreasRepository.replaceUserAreas("userId", ["GYM"]);

        expect(prisma.userArea.deleteMany).toHaveBeenCalledWith({
            where: { userId: "userId" },
        });
    });

    it("should create areas with the correct areas and userId", async () => {
        vi.mocked(prisma.$transaction).mockResolvedValue([
            {},
            [{ area: "GYM" }, { area: "FINANCES" }],
        ]);

        await userAreasRepository.replaceUserAreas("userId", ["GYM", "FINANCES"]);

        expect(prisma.userArea.createManyAndReturn).toHaveBeenCalledWith({
            data: [
                { userId: "userId", area: "GYM" },
                { userId: "userId", area: "FINANCES" },
            ],
            select: { area: true },
            skipDuplicates: true,
        });
    });
})