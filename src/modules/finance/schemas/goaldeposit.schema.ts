import z from "zod";

export const goalDepositSchema = z.object({
    params: z.object({
        id: z.uuid("Invalid goal id")
    }),
    body: z.object({
        amount: z.number("Invalid amount value").gt(0, "Amount must be greater than $0")
    }, "Invalid request body")
})