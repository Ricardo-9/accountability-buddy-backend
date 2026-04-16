import z from "zod";

export const deleteByIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid id"),
  }),
});

export type DeleteByIdSchemaType = z.infer<typeof deleteByIdSchema>["params"];
