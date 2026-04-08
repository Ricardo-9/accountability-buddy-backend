import z from "zod";

export const getStatementSchema = z.object({
    query: z.object({
        startDate: z.iso.date({ error: "Invalid start date" })
            .transform((val) => new Date(val))
            .optional(),
        endDate: z.iso.date({ error: "Invalid end date" })
            .transform((val) => new Date(val))
            .optional(),
        limit: z.coerce.number()
            .min(1, { error: "Limit must be at least 1" })
            .max(100, { error: "Limit must be at most 100" })
            .default(20),
        cursor: z.uuid({ error: "Invalid cursor" }).optional()
    }).refine((data) => {
        if (data.startDate && data.endDate) {
            return data.startDate <= data.endDate
        }
        return true
    }, { error: "Start date must be before end date", path: ["startdate"]})
})

export type GetStatementSchema = z.infer<typeof getStatementSchema>["query"]