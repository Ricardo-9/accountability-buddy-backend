import { RecurrenceUnit, TransactionType } from "@prisma/client";
import { z } from "zod";

export const updateRecurringTransactionSchema = z.object({
  body: z.object({
    type: z
      .enum(TransactionType, {
        error: "Invalid transaction type",
      })
      .optional(),
    name: z
      .string({ 
        error: "Name must be a string",
      })
      .optional(),
    amount: z.coerce
      .number({
        error: "Amount must be a number",
      })
      .gt(0, { message: "Amount value must be greater than $0" })
      .optional(),
    recurrenceValue: z.coerce
      .number({
        error: "Recurrence value must be a number",
      })
      .int({ message: "Recurrence value must be an integer" })
      .min(1, { message: "Recurrence value must be at least 1" })
      .optional(),
    recurrenceUnit: z
      .enum(RecurrenceUnit, {
        error: "Invalid recurrence unit",
      })
      .optional(),
    firstOccurrence: z.iso
      .date({
        error: "Expected format: YYYY-MM-DD",
      })
      .transform((val) => new Date(`${val}T00:00:00`))
      .optional(),
    categoryId: z
      .uuid("Invalid category id")
      .nullable()
      .optional(),
    dayOfMonth: z.coerce
      .number("Invalid day of month")
      .int("Day of month must be an integer")
      .gt(0, "Day of month must be greater than 0")
      .lte(31, "Day of month cannot be greater than 31")
      .nullable()
      .optional()
      
  }).strict(),
  params: z.object({
    id: z.string().uuid()
  })
});


export type updateRecurringTransactionBodyType = z.infer<typeof updateRecurringTransactionSchema>["body"]
export type updateRecurringTransactionIdType = z.infer<typeof updateRecurringTransactionSchema>["params"]