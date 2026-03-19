import { z } from "zod";

const updateProfileBodySchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must have at least 2 characters")
      .max(120)
      .optional(),
    birthDate: z.coerce.date().optional(),
    phone: z.e164().optional(),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.birthDate !== undefined ||
      data.phone !== undefined,
    { message: "At least one field must be provided" },
  )
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as { fullName?: string; birthDate?: Date; phone?: string };
  });

export const updateProfileSchema = z.object({
  body: updateProfileBodySchema,
});

export type UpdateProfile = z.infer<typeof updateProfileBodySchema>;