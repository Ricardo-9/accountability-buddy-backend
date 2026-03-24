import z from "zod";

export const createFinancialAccountSchema = z.object({
    body: z.object({
        balance: z.number({
            error: (iss) => {
                if (iss.input === undefined) return "Balance is required"
                if (iss.code === "invalid_type") return "Balance must be a number"
                return "Invalid balance"
            }
        }).min(0, {error: "The minimum balance value is $0"})
    })
})