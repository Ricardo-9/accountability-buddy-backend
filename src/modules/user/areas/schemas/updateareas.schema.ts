import z from "zod";
import { AccountabilityArea } from "@prisma/client";

export const updateAreasSchema = z.object({
    body: z.object({
        areas: z.enum(AccountabilityArea, {
            error: "Invalid accountability area"
        }).array().min(1, {error: "At least one area must be selected"})
    })
})