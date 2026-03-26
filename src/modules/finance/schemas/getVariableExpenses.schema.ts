import { z } from 'zod';

export const getVariableExpensesSchema = z.object({
    query: z.object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        categoryId: z.string().uuid().optional()
    }).refine(
        (data) => {
            if(data.startDate && data.endDate){
                return data.startDate <= data.endDate
            }
            return true

        },{ message: "startDate must be before or equal to endDate" }
    )
})

export type GetVariableExpensesQueryType = z.infer<typeof getVariableExpensesSchema>["query"];
