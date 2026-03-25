import { z } from "zod";

export const createFinancialCategorySchema = z.object({
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
});

export type createfinancialCategorySchema = z.infer<typeof createFinancialCategorySchema>["body"]
