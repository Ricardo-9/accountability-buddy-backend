import { describe, expect, it} from "vitest";
import request from "supertest";
import app from "../../../src/app.js";

describe("error handler middleware", () => {
  it("should return GENERIC_APP_ERROR when an AppError ocurrs", async () => {
    const response = await request(app)
      .post("/error-test")
      .send({ text: "AppError" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("GENERIC_APP_ERROR");
  });

  it("should return GENERIC_ERROR when an Error ocurrs", async () => {
    const response = await request(app)
      .post("/error-test")
      .send({ text: "Error" });

    expect(response.statusCode).toBe(500);
    expect(response.body.error.code).toBe("SERVER_ERROR");
  });

  it("should return VALIDATION_CODE when a ZodError occurs", async () => {
    const response = await request(app)
      .post("/error-test")
      .send({ text: "ZodError" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_CODE");
  });

  it("should not return any error when the request is valid", async () => {
    const response = await request(app)
      .post("/error-test")
      .send({ text: "Success" });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("ONLY_FOR_TESTS");
  });
});
