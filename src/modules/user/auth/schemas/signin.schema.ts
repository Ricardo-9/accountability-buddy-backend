import z from "zod";
import { emailField, passwordField } from "./fields.js";

export const signinSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
});
