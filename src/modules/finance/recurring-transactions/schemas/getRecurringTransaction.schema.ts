import { z } from "zod";

export const getRecurringTransactionSchema = z.object({
  query: z
    .object({
      type: z.enum(["INCOME", "EXPENSE"]).optional(),
      categoryId: z.string().uuid().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      order: z.enum(["asc", "desc"]).default("asc"),
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

export type getRecurringTransactionType = z.infer<
  typeof getRecurringTransactionSchema
>["query"];
