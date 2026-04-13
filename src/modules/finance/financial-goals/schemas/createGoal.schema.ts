import { DurationUnit, InvestorStyle } from "@prisma/client";
import z from "zod";

export const createGoalSchema = z.object({
  body: z
    .object({
      name: z.string({
        error: (iss) => {
          if (iss.input === undefined) return "Name is required";
          if (iss.code === "invalid_type") return "Name must be a string";
          return "Invalid goal name";
        },
      }),

      target: z
        .number({
          error: (iss) => {
            if (iss.input === undefined) return "Target is required";
            if (iss.code === "invalid_type") return "Target must be a number";
            return "Invalid target value";
          },
        })
        .gt(0, { message: "Target value must be greater than $0" }),

      initialAmount: z
        .number({
          error: (iss) => {
            if (iss.input === undefined) return "Initial amount is required";
            if (iss.code === "invalid_type")
              return "Initial amount must be a number";
            return "Invalid initial amount value";
          },
        })
        .gte(0, { message: "Initial amount cannot be negative" }),

      durationValue: z
        .number({
          error: (iss) => {
            if (iss.input === undefined) return "Duration value is required";
            if (iss.code === "invalid_type")
              return "Duration value must be a number";
            return "Invalid duration value";
          },
        })
        .int({ message: "Duration must be an integer" })
        .min(1, { message: "Duration must be at least 1" }),

      durationUnit: z.enum(DurationUnit, {
        error: "Invalid duration unit",
      }),

      style: z.enum(InvestorStyle, {
        error: "Invalid investor style",
      }),

      categoryId: z
        .uuid("Invalid category id")
        .nullable()
        .optional()
        .transform((val) => val ?? null),
    })
    .strict()
    .refine(
      (data) => {
        if (data.initialAmount <= data.target) return true;
        return false;
      },
      {
        error: "Initial amount cannot be greater than target value",
        path: ["initialAmount"],
      },
    ),
});
