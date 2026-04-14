import z from "zod";

export const getCategoriesSchema = z.object({
  query: z.object({
    limit: z.coerce
      .number({ error: "Limit must be a number" })
      .int({ error: "Limit must be an integer" })
      .min(1, { error: "Limit must be at least 1" })
      .max(100, { error: "Limit must be at most 100" })
      .default(10),
    cursor: z.uuid({ error: "Invalid cursor" }).optional(),
  }),
});

export type GetCategoriesSchemaType = z.infer<typeof getCategoriesSchema>["query"];
