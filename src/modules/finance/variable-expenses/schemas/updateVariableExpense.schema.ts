import { z } from "zod";

export const updateVariableExpenseSchema = z.object({
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
      .min(2, { error: "The minimum number of characters is 2" })
      .max(120, { error: "The maximum number of characters is 120" })
      .optional(),
    amount: z.coerce
      .number({
        error: "amount for variable expense must be a number",
      })
      .min(1, { error: "The amount of variable expense is required" })
      .max(999_999_999_999.99, {
        error: "The maximum number of characters for the amount value is 14",
      })
      .positive("The amount must be positive")
      .multipleOf(0.01, "The amount can have a maximum of two decimal places")
      .optional(),

    expenseDate: z.coerce.date().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type updateVariableExpenseType = z.infer<
  typeof updateVariableExpenseSchema
>["body"];
export type updateVariableExpenseIdType = z.infer<
  typeof updateVariableExpenseSchema
>["params"];
