import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { AppError } from "../../../src/core/errors/AppError";

vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(),
}));

const mockedJWTverify = vi.mocked(jwtVerify);
const mockedCreateRemoteJWKSet = vi.mocked(createRemoteJWKSet);

describe("Authentication Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreateRemoteJWKSet.mockReturnValue({} as any);
  });

  it("should return UNAUTHORIZED when the authorization header does not exist", async () => {
    const response = await request(app).get("/protected-test");

    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(response.statusCode).toBe(401);
  });

  it("should return UNAUTHORIZED when the JWT token is invalid", async () => {
    mockedJWTverify.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Invalid or expired token", 401),
    );

    const response = await request(app)
      .get("/protected-test")
      .set("Authorization", "Bearer Invalid-Token");

    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(response.body.error.message).toBe("Invalid or expired token");
    expect(response.statusCode).toBe(401);
  });

  it("should allow request when the JWT is valid", async () => {
    mockedJWTverify.mockResolvedValue({
      payload: {
        sub: "test-user-id",
        email: "test@user",
      },
    } as any);

    const response = await request(app)
      .get("/protected-test")
      .set("Authorization", "Bearer Valid-Token");

    expect(response.statusCode).toBe(200);
  });
});
