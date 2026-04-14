import { z } from "zod";

export const updateFinancialCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        error: (iss) => {
          if (iss.code === "invalid_type")
            return "name for category must be a string";
          if (iss.input === undefined) return "name for category is required";
          return "Invalid name for category";
        },
      })
      .min(2, { error: "The minimum number of characters is 2" })
      .max(120, { error: "The maximum number of characters is 120" }),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type updateFinancialCategoryBody = z.infer<
  typeof updateFinancialCategorySchema
>["body"];
export type updatefinancialCategoryId = z.infer<
  typeof updateFinancialCategorySchema
>["params"];
