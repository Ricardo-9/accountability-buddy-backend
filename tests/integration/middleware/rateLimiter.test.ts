import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../../../src/app";
import { authLimiter } from "../../../src/modules/user/auth/middlewares/authRateLimit";

describe("Rate limiter", () => {
  beforeEach(async () => {
    await authLimiter.resetKey("::1");
    await authLimiter.resetKey("127.0.0.1");
    await authLimiter.resetKey("::ffff:127.0.0.1");
  });

  it("should return an error (429) when the limit was exceeded", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post("/user/signin").send({
        email: "example-email@gmail.com",
        password: "example-password",
      });
    }

    const response = await request(app)
      .post("/user/signin")
      .send({ email: "example-email@gmail.com", password: "example-password" });

    expect(response.status).toBe(429);

    expect(response.body.error.code).toBe("TOO_MANY_REQUESTS");
  });

  it("should not return an error (429) when the requests respect the limit", async () => {
    const response = await request(app)
      .post("/user/signin")
      .send({ email: "example-email@gmail.com", password: "example-password" });

    expect(response.status).not.toBe(429);
  });
});
