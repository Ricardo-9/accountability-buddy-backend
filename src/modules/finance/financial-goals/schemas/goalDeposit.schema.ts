import z from "zod";

export const goalDepositSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid goal id"),
  }),
  body: z.object(
    {
      amount: z
        .number({
          error: (iss) => {
            if (iss.input === undefined) return "Amount is required";
            return "Invalid amount value";
          },
        })
        .gt(0, "Amount must be greater than $0"),
    },
    "Invalid request body",
  ),
});
