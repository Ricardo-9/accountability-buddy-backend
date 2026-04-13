import z from "zod";
import { emailField, passwordField } from "./fields.js";

export const signupSchema = z.object({
    body: z.object({
        email: emailField,
        password: passwordField,
        confirmPassword: z.string({
            error: (iss) => {
                if (iss.input === undefined) return `Confirm password input is required`
                return `Invalid confirm password input`
            }
        }).trim()
    }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    })
})