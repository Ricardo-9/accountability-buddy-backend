import {z} from 'zod';

export const getOneRecurringTransaction = z.object({
    params : z.object({
        id: z.string().uuid()
    })
})

export type getOneRecurringTransactionType = z.infer<typeof getOneRecurringTransaction>["params"]