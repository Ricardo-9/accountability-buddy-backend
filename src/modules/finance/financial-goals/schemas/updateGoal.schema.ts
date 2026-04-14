import { DurationUnit, InvestorStyle } from "@prisma/client";
import z from "zod";

export const updateGoalSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid id"),
  }),
  body: z
    .object(
      {
        name: z.string("Invalid goal name").optional(),
        target: z
          .number("Invalid target value")
          .gt(0, "Target value must be greater than $0")
          .optional(),
        initialAmount: z
          .number("Invalid initial amount value")
          .gte(0, "Initial amount cannot be negative")
          .optional(),
        durationValue: z
          .number("Invalid duration value")
          .int("Duration must be an integer")
          .min(1, "Duration must be at least 1")
          .optional(),
        durationUnit: z.enum(DurationUnit, "Invalid duration unit").optional(),
        style: z.enum(InvestorStyle, "Invalid investor style").optional(),
        categoryId: z
          .uuid("Invalid category id")
          .nullable()
          .optional()
          .transform((val) => val ?? null),
      },
      "Invalid request body",
    )
    .strict()
    .refine(
      (data) => {
        if (data.initialAmount !== undefined && data.target !== undefined) {
          return data.initialAmount <= data.target;
        }
        return true;
      },
      {
        error: "Initial amount cannot be greater than target value",
        path: ["initialAmount"],
      },
    ),
});
