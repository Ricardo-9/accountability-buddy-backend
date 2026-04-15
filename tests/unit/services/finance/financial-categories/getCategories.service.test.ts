import { describe, expect, it, vi, beforeEach } from "vitest";
import { getCategoriesService } from "../../../../../src/modules/finance/financial-categories/services/getCategories.service";
import { financialCategoriesRepository } from "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";

const mockCategory = {
  id: "categoryId",
  name: "MOCKCATEGORY",
  isDefault: false,
  updatedAt: new Date(),
};

vi.mock(
  "../../../../../src/modules/finance/repositories/financialCategories.repository",
);

describe("get categories service test",()=>{

    it("should return categories for the user",async()=>{
        vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue([mockCategory])

        const result = await getCategoriesService("userId")

        expect(result).toEqual([mockCategory])
    }),

    it("should return categories for the user",async()=>{

    }),

    it("should return categories for the user",async()=>{

    }),

    it("should return categories for the user",async()=>{

    }),



})