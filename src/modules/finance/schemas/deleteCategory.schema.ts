import { z } from "zod";

export const deleteFinancialCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  })
});

export type deletefinancialCategoryId = z.infer<typeof deleteFinancialCategorySchema>["params"]