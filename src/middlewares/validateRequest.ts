import { Request, Response, NextFunction } from "express"
import { z } from "zod"

export function validateRequest(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        })

        if (!result.success) {
            return next(result.error)
        }

        const data = result.data as {
            body: Request["body"],
            params: Request["params"],
            query: Request["query"]
        }

        req.body = data.body
        req.params = data.params
        Object.defineProperty(req, "query", {
            value: data.query,
            writable: true
        })

        next()
    }
}