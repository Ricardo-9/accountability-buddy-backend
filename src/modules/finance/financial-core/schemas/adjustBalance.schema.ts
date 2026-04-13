import z from "zod";

export const adjustBalanceSchema = z.object({
  body: z
    .object({
      amount: z
        .number({
          error: (iss) => {
            if (iss.input === undefined) return "Amount is required";
            if (iss.code === "invalid_type") return "Amount must be a number";
            return "Invalid amount";
          },
        })
        .gt(0, { error: "The amount value must be greater than $0" }),
      type: z.enum(["INCREMENT", "DECREMENT"], {
        error: (iss) => {
          if (iss.input === undefined) return "Type of transaction is required";
          if (iss.code === "invalid_value") return "Unknown transaction type";
          return "Invalid type";
        },
      }),
      reason: z.enum(["INCOME", "EXPENSE"], {
        error: (iss) => {
          if (iss.input === undefined)
            return "Reason of transaction is required";
          if (iss.code === "invalid_value") return "Unknown transaction reason";
          return "Invalid reason";
        },
      }),
    })
    .refine(
      (data) => {
        if (data.type === "DECREMENT") return data.reason === "EXPENSE";
        if (data.type === "INCREMENT") return data.reason === "INCOME";
        return false;
      },
      {
        error: "Type and reason for the transaction are not compatible",
        path: ["type"],
      },
    ),
});
