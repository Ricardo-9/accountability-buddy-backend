import { describe, beforeEach, vi, expect, it } from "vitest";
import { prisma } from "../../../../src/lib/prisma.js";
import request from "supertest";
import app from "../../../../src/app.js";
import { jwtVerify } from "jose";

vi.mock("jose", async (importOriginal) => {
  const original = await importOriginal<typeof import("jose")>();

  return {
    ...original,
    createRemoteJWKSet: vi.fn(),
    jwtVerify: vi.fn().mockResolvedValue({
      payload: { sub: "userId", email: "user@test.com" },
    }),
  };
});

vi.mock("../../../../src/lib/prisma.js", () => ({
  prisma: {
    userArea: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createManyAndReturn: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const validToken = "valid-token";

describe("User area routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /areas", () => {
    it("should return 200 and the user areas", async () => {
      vi.mocked(prisma.userArea.findMany).mockResolvedValue([
        { area: "GYM" },
        { area: "FINANCES" },
      ] as any);
      const response = await request(app)
        .get("/user/areas")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: ["GYM", "FINANCES"],
      });
    });

    it("should return 200 and an empty array when the user has no areas", async () => {
      vi.mocked(prisma.userArea.findMany).mockResolvedValue([]);

      const response = await request(app)
        .get("/user/areas")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it("should return 401 when token is invalid", async () => {
      vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("Invalid token"));

      const response = await request(app)
        .get("/user/areas")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should return 401 when no token is provided", async () => {
      const response = await request(app).get("/user/areas");

      expect(response.status).toBe(401);
    });

    it("should return 500 if database fails", async () => {
      vi.mocked(prisma.userArea.findMany).mockRejectedValueOnce(
        new Error("DB error"),
      );

      const response = await request(app)
        .get("/user/areas")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
    });
  });

  describe("PUT /areas", () => {
    it("should return 200 and the updated areas", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        {},
        [{ area: "GYM" }, { area: "FINANCES" }],
      ]);

      const response = await request(app)
        .put("/user/areas")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ areas: ["GYM", "FINANCES"] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: ["GYM", "FINANCES"],
      });
    });

    it("should return 401 when token is invalid", async () => {
      vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("Invalid token"));

      const response = await request(app)
        .put("/user/areas")
        .set("Authorization", "Bearer invalid-token")
        .send({ areas: ["GYM", "FINANCES"] });

      expect(response.status).toBe(401);
    });

    it("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put("/user/areas")
        .send({ areas: ["GYM", "FINANCES"] });

      expect(response.status).toBe(401);
    });

    it("should return 400 when body is invalid", async () => {
      const response = await request(app)
        .put("/user/areas")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ areas: "is not an array" });

      expect(response.status).toBe(400);
    });

    it("should return 400 when the areas array is empty", async () => {
      const response = await request(app)
        .put("/user/areas")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ areas: [] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when areas contains an invalid value", async () => {
      const response = await request(app)
        .put("/user/areas")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ areas: ["IS_NOT_AN_ACCOUNTABILITY_AREA"] });

      expect(response.status).toBe(400);
    });

    it("should return 400 when body is missing", async () => {
      const response = await request(app)
        .put("/user/areas")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
    });

    it("should return 500 if database fails", async () => {
      vi.mocked(prisma.$transaction).mockRejectedValueOnce(
        new Error("DB error"),
      );

      const response = await request(app)
        .put("/user/areas")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ areas: ["GYM"] });

      expect(response.status).toBe(500);
    });
  });
});
