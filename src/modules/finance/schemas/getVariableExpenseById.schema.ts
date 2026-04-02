import {z} from 'zod';

export const getVariableExpenseSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
})

export type getVariableExpenseType = z.infer<typeof getVariableExpenseSchema>["params"]