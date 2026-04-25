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
    const result: {
      fullName?: string;
      phone?: string;
      birthDate?: Date;
    } = {};
    
    if (data.fullName !== undefined) result.fullName = data.fullName;
    if (data.phone !== undefined) result.phone = data.phone;
    if (data.birthDate !== undefined) result.birthDate = data.birthDate;
    return result;
  });

export const updateProfileSchema = z.object({
  body: updateProfileBodySchema,
});

export type UpdateProfileBodyType = z.infer<typeof updateProfileBodySchema>;
