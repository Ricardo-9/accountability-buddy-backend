import { z } from "zod";


export const createVariableExpenseSchema = z.object({
  body: z.object({
    categoryId: z
      .string({
        error: "categoryID for variable expense must be a string(uuid)",
      })
      .uuid()
      .optional()
      .nullable(),
    name: z
      .string({ error: "name for variable expense must be a string" })
      .min(1, { error: "The name of variable expense is required" })
      .max(120, { error: "The maximum number of characters is 120" }),
    amount: z.coerce
      .number({
        error: "amount for variable expense must be a number",
      })
      .min(1, { error: "The amount of variable expense is required" })
      .max(999_999_999_999.99, {
        error: "The maximum number of characters for the amount value is 14",
      })
      .positive("The amount must be positive")
      .multipleOf(0.01, "The amount can have a maximum of two decimal places"),

    expenseDate: z.coerce.date(),
  }),
});

export type CreateVariableExpenseType = z.infer<typeof createVariableExpenseSchema>["body"]