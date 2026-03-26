import { describe, it, expect, vi } from "vitest";
import { jwtVerify } from "jose";
import { prisma } from "../../../src/lib/prisma";
import request from "supertest";
import app from "../../../src/app";
import { AccountabilityArea } from "@prisma/client";

type HttpMethod = "get" | "post" | "patch" | "put" | "delete"

export function authMiddlewareTests(method: HttpMethod, route: string, area: AccountabilityArea) {
    describe("Auth middleware", () => {
        it("should return 401 if token is missing", async () => {
            const response = await request(app)[method](route)
            expect(response.status).toBe(401)
        })

        it("should return 401 if token is invalid", async () => {
            vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("Invalid token"))

            const response = await request(app)
                [method](route)
                .set("Authorization", "Bearer invalid-token")

            expect(response.status).toBe(401)
        })

        it(`should return 403 if user is not registered in ${area}`, async () => {
            vi.mocked(prisma.userArea.findFirst).mockResolvedValue(null)

            const response = await request(app)
                [method](route)
                .set("Authorization", "Bearer invalid-token")

            expect(response.status).toBe(403)
        })
    })
}