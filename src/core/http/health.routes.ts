import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router()

router.get("/health", async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`

        res.status(200).json({
            status: "ok",
            database: "connected"
        })
    } catch (err) {
        return next(err)
    }
})

export { router as healthRouter }