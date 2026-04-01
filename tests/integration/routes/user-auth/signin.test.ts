import { describe, beforeEach, vi, expect, it } from "vitest"
import request from "supertest"
import app from "../../../../src/app.js"
import { supabase } from "../../../../src/lib/supabase.js"
import { AuthError, Session, User } from "@supabase/supabase-js"

vi.mock("../../../../src/lib/supabase.js", () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn()
        }
    }
}))

describe("POST /signin", () => {
    beforeEach(() => vi.clearAllMocks())

    describe("Happy path", () => {
        it("should return 200, user id and email and the access token", async () => {
            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: {
                    user: {
                        id: "random-id",
                        email: "test@example.com"
                    } as User,
                    session: {
                        access_token: "valid-token"
                    } as Session
                },
                error: null
            })

            const response = await request(app)
                .post("/user/signin")
                .send({
                    email: "test@example.com",
                    password: "12345678",
                })

            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                success: true,
                data: {
                    id: "random-id",
                    email: "test@example.com",
                    accessToken: "valid-token"
                }
            })
        })

        it("should normalize the email field", async () => {
            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: {
                    user: {
                        id: "random-id",
                        email: "test@example.com"
                    } as User,
                    session: {
                        access_token: "valid-token"
                    } as Session
                },
                error: null
            })

            const response = await request(app)
                .post("/user/signin")
                .send({
                    email: "TEST@EXAMPLE.COM",
                    password: "12345678",
                })

            expect(response.status).toBe(200)
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "12345678"
            })
        })
    })

    describe("Supabase errors", () => {
        it("should return the error message if Supabase returns an error", async () => {
            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: {
                    user: null,
                    session: null
                },
                error: {
                    message: "Invalid email or password",
                } as AuthError
            })

            const response = await request(app)
                .post("/user/signin")
                .send({
                    email: "invalid-email@example.com",
                    password: "invalid-password",
                })

            expect(response.status).toBe(401)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password"
                }
            })
        })
    })

    describe("Validation errors", () => {
        it("should return 400 if the email is missing", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({
                    password: "12345678",
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid data",
                    details: [
                        {
                            field: "body.email",
                            message: "Email is required"
                        }
                    ]
                }
            })
        })

        it("should return 400 if the password is missing", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({
                    email: "test@example.com"
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid data",
                    details: [
                        {
                            field: "body.password",
                            message: "Password is required"
                        }
                    ]
                }
            })
        })

        it("should return 400 if the email is invalid", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({
                    email: "invalidemail.com",
                    password: "12345678",
                    confirmPassword: "12345678"
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid data",
                    details: [
                        {
                            field: "body.email",
                            message: "Invalid email format"
                        }
                    ]
                }
            })
        })

        it("should return 400 if the password is too short", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({
                    email: "test@example.com",
                    password: "123",
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid data",
                    details: [
                        {
                            field: "body.password",
                            message: "Password must have 8 characters or more"
                        }
                    ]
                }
            })
        })
    })
})