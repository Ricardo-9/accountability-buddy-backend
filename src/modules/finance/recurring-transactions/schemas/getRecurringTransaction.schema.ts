import z from "zod";
import { TransactionType } from "@prisma/client";

export const getRecurringTransactionSchema = z.object({
  query: z
    .object({
      limit: z.coerce
        .number({ message: "Limit must be a number" })
        .int({ message: "Limit must be an integer" })
        .min(1, { message: "Limit must be at least 1" })
        .max(100, { message: "Limit must be at most 100" })
        .default(10),
      cursor: z.string().uuid({ message: "Invalid cursor" }).optional(),
      type: z
        .nativeEnum(TransactionType, {
          message: "Type must be INCOME or EXPENSE",
        })
        .optional(),
      categoryId: z.string().uuid({ message: "Invalid categoryId" }).optional(),
      startDate: z.coerce.date({ message: "Invalid startDate" }).optional(),
      endDate: z.coerce.date({ message: "Invalid endDate" }).optional(),
    })
    .refine(
      (data) => {
        // Se ambas as datas forem fornecidas, startDate deve ser <= endDate
        if (data.startDate && data.endDate) {
          return data.startDate <= data.endDate;
        }
        return true;
      },
      {
        message: "startDate must be before or equal to endDate",
        path: ["startDate"],
      },
    ),
});

export type GetRecurringTransactionSchemaType = z.infer<
  typeof getRecurringTransactionSchema
>["query"];
