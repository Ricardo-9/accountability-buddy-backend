import z from "zod";

export const signupSchema = z.object({
    body: z.object({
        email: z.email({
            error: (iss) => {
                if (iss.input === undefined) return `Email is required`
                if (iss.code === "invalid_type") return `Email must be a ${iss.expected}`
                if (iss.code === "invalid_format") return `Invalid email format`
            }
        }),
        password: z.string({
            error: (iss) => {
                if (iss.input === undefined) return `Password is required`
                if (iss.code === "invalid_type") return `Password must be a ${iss.expected}`
            }
        }).min(8, { error: (iss) => `Password must have ${iss.minimum} characters or more` })
    })
})