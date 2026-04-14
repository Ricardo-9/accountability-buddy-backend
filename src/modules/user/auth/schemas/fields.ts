import z from "zod";

export const emailField = z
  .email({
    error: (iss) => {
      if (iss.input === undefined) return `Email is required`;
      if (iss.code === "invalid_type") return `Email must be a ${iss.expected}`;
      if (iss.code === "invalid_format") return `Invalid email format`;
      return `Invalid email`;
    },
  })
  .transform((val) => val.toLowerCase().trim());

export const passwordField = z
  .string({
    error: (iss) => {
      if (iss.input === undefined) return `Password is required`;
      if (iss.code === "invalid_type")
        return `Password must be a ${iss.expected}`;
      return `Invalid password`;
    },
  })
  .min(8, {
    error: (iss) => `Password must have ${iss.minimum} characters or more`,
  });
