import { describe, it, expect, beforeEach, vi } from "vitest";
import { ensureCategoryExists } from "../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper";

let txMock: any

describe("Ensure category exists helper test", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        txMock = {
            financialCategory: {
                findFirst: vi.fn()
            }
        }
    })

    it("should do nothing if categoryId is null", async () => {
        await ensureCategoryExists(txMock, "userId", null)

        expect(txMock.financialCategory.findFirst).not.toHaveBeenCalled()
    })

    it("should do nothing if category exists", async () => {
        vi.mocked(txMock.financialCategory.findFirst).mockResolvedValue({ id: "categoryId" } as any)

        await expect(ensureCategoryExists(txMock, "userId", "categoryId")).resolves.toBeUndefined()

        expect(txMock.financialCategory.findFirst).toHaveBeenCalledWith({
            where: { id: "categoryId", userId: "userId", deletedAt: null },
            select: { id: true }
        })
    })

    it("should throw 404 if category does not exist", async () => {
        vi.mocked(txMock.financialCategory.findFirst).mockResolvedValue(null)

         await expect(ensureCategoryExists(txMock, "userId", "categoryId")).rejects.toMatchObject({
            code: "NOT_FOUND",
            message: "Category not found",
            statusCode: 404
         })

         expect(txMock.financialCategory.findFirst).toHaveBeenCalled()
    })
})