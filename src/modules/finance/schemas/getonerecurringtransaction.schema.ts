import {z} from 'zod';

export const getOneRecurringTransactionSchema = z.object({
    params : z.object({
        id: z.string().uuid()
    })
})

export type getOneRecurringTransactionType = z.infer<typeof getOneRecurringTransactionSchema>["params"]