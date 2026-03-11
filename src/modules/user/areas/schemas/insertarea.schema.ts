import z from "zod";
import { AccountabilityArea } from "@prisma/client";

export const insertAreaSchema = z.object({
    body: z.object({
        area: z.enum(AccountabilityArea, {
            error: (iss) => {
                if(iss.code === "invalid_value") return "Accountability area not suported"
            }
        })
    })
})