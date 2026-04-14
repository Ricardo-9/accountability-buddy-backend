import z from "zod";

export const getByIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid id"),
  }),
});

export type GetByIdSchemaType = z.infer<typeof getByIdSchema>["params"];
