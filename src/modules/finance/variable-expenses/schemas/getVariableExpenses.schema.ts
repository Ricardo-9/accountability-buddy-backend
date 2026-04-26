import { z } from "zod";

export const getVariableExpensesSchema = z.object({
  query: z
    .object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      categoryId: z.string().uuid().optional(),
      limit: z.coerce
            .number({ error: "Limit must be a number" })
            .int({ error: "Limit must be an integer" })
            .min(1, { error: "Limit must be at least 1" })
            .max(100, { error: "Limit must be at most 100" })
            .default(10),
      cursor: z.string().uuid({ error: "Invalid cursor" }).optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.startDate <= data.endDate;
        }
        return true;
      },
      { message: "startDate must be before or equal to endDate" },
    ),
});

export type GetVariableExpensesQueryType = z.infer<
  typeof getVariableExpensesSchema
>["query"];
