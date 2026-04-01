import { z } from "zod";

export const deleteVariableExpenseSchema = z.object({
  
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type deleteVariableExpenseIdType = z.infer<
  typeof deleteVariableExpenseSchema
>["params"];
