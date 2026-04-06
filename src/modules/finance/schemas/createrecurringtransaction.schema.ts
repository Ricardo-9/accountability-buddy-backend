import { RecurrenceUnit, TransactionType } from "@prisma/client";
import z from "zod";

export const createRecurringTransactionSchema = z.object({
    body: z.object({
        type: z.enum(TransactionType, {
            error: (iss) => {
                if (iss.input === undefined) return "Transaction type is required"
                return "Invalid transaction type"
            }
        }),
        name: z.string({
            error: (iss) => {
                if (iss.input === undefined) return "Name is required"
                if (iss.code === "invalid_type") return "Name must be a string"
                return "Invalid transaction name"
            }
        }),
        amount: z.number({
            error: (iss) => {
                if (iss.input === undefined) return "Amount is required"
                if (iss.code === "invalid_type") return "Amount must be a number"
                return "Invalid amount value"
            }
        }).gt(0, { message: "Amount value must be greater than $0" }),
        recurrenceValue: z.number({
            error: (iss) => {
                if (iss.input === undefined) return "Recurring value is required"
                if (iss.code === "invalid_type") return "Recurring value must be a number"
                return "Invalid recurring value"
            }
        }).int({ message: "Recurring value must be an integer" })
            .min(1, { message: "Recurring value must be at least 1" }),
        recurrenceUnit: z.enum(RecurrenceUnit, {
            error: (iss) => {
                if (iss.input === undefined) return "Recurrence unit is required"
                return "Invalid recurrence unit"
            }
        }),
        firstOccurrence: z.iso.date({
            error: (iss) => {
                if (iss.input === undefined) return "First occurrence date is required"
                if (iss.code === "invalid_format") return "Expected format: YYYY-MM-DD"
                return "Invalid first ocurrence date"
            }
        }),
        categoryId: z.uuid("Invalid category id")
            .nullable()
            .optional()
            .transform(val => val ?? null),
        dayOfMonth: z.number("Invalid day of month")
            .int("Day of month must be an integer")
            .gt(0, "Day of month must be greater than 0")
            .lte(31, "Day of month cannot be greater than 31")
            .nullable()
            .optional()
            .transform(val => val ?? null),
    })
        .superRefine((data, ctx) => {
            const now = new Date()
            const firstOcurrenceToDate = new Date(data.firstOccurrence)

            if (firstOcurrenceToDate < now) {
                ctx.addIssue({
                    code: "custom",
                    message: "First ocurrence cannot be in the past",
                    path: ["firstOccurrence"]
                })
            }

            if (data.recurrenceUnit === "MONTH" && !data.dayOfMonth) {
                ctx.addIssue({
                    code: "custom",
                    message: "Day of month is required for monthly recurrence",
                    path: ["dayOfMonth"]
                })
            }

            if (data.recurrenceUnit === "MONTH" &&
                data.dayOfMonth &&
                firstOcurrenceToDate.getDate() !== data.dayOfMonth) {
                ctx.addIssue({
                    code: "custom",
                    message: "First occurrence must match day of month",
                    path: ["firstOccurrence"]
                })
            }

            if (data.recurrenceUnit === "DAY" && data.dayOfMonth) {
                ctx.addIssue({
                    code: "custom",
                    message: "dayOfMonth should not be provided for daily recurrence",
                    path: ["dayOfMonth"]
                })
            }
        })
})

export type CreateRecurringTransaction = z.infer<typeof createRecurringTransactionSchema>["body"]