import { describe, beforeEach, vi, expect, it } from "vitest"
import request from "supertest"
import app from "../../../../../src/app"
import { supabase } from "../../../../../src/lib/supabase"
import { AuthError, User } from "@supabase/supabase-js"

vi.mock("../../../../../src/lib/supabase", () => ({
    supabase: {
        auth: {
            signUp: vi.fn()
        }
    }
}))

describe("POST /signup", () => {
    beforeEach(() => vi.clearAllMocks())

    describe("Happy path", () => {
        it("should return 200, the user id and email", async () => {
            vi.mocked(supabase.auth.signUp).mockResolvedValue({
                data: {
                    user: {
                        id: "random-id",
                        email: "test@example.com"
                    } as User,
                    session: null
                },
                error: null
            })

            const response = await request(app)
                .post("/user/signup")
                .send({
                    email: "test@example.com",
                    password: "12345678",
                    confirmPassword: "12345678"
                })

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                success: true,
                data: {
                    id: "random-id",
                    email: "test@example.com"
                }
            })
        })

        it("should normalize the email field", async () => {
            vi.mocked(supabase.auth.signUp).mockResolvedValue({
                data: {
                    user: {
                        id: "random-id",
                        email: "test@example.com"
                    } as User,
                    session: null
                },
                error: null
            })
            const response = await request(app)
                .post("/user/signup")
                .send({
                    email: "TEST@EXAMPLE.COM",
                    password: "12345678",
                    confirmPassword: "12345678"
                })

            expect(response.status).toBe(201)
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "12345678"
            })
        })
    })

    describe("Supabase errors", () => {
        it("should return the error message if Supabase returns an error", async () => {
            vi.mocked(supabase.auth.signUp).mockResolvedValue({
                data: {
                    user: null,
                    session: null
                },
                error: {
                    message: "User already registered",
                } as AuthError
            })

            const response = await request(app)
                .post("/user/signup")
                .send({
                    email: "test@example.com",
                    password: "12345678",
                    confirmPassword: "12345678"
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "AUTH_ERROR",
                    message: "User already registered"
                }
            })
        })

        it("should return 400 if the Supabase returns data.user null", async () => {
            vi.mocked(supabase.auth.signUp).mockResolvedValue({
                data: {
                    user: null,
                    session: null
                },
                error: null
            })

            const response = await request(app)
                .post("/user/signup")
                .send({
                    email: "test@example.com",
                    password: "12345678",
                    confirmPassword: "12345678"
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "AUTH_ERROR",
                    message: "User creation failed"
                }
            })
        })
    })

    describe("Validation errors", () => {
        it("should return 400 if the email is missing", async () => {
            const response = await request(app)
                .post("/user/signup")
                .send({
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
                            message: "Email is required"
                        }
                    ]
                }
            })
        })

        it("should return 400 if the password is missing", async () => {
            const response = await request(app)
                .post("/user/signup")
                .send({
                    email: "test@example.com",
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
                            field: "body.password",
                            message: "Password is required"
                        }
                    ]
                }
            })
        })

        it("should return 400 if the confirm password is missing", async () => {
            const response = await request(app)
                .post("/user/signup")
                .send({
                    email: "test@example.com",
                    password: "12345678"
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid data",
                    details: [
                        {
                            field: "body.confirmPassword",
                            message: "Confirm password input is required"
                        }
                    ]
                }
            })
        })

        it("should return 400 if the email is invalid", async () => {
            const response = await request(app)
                .post("/user/signup")
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
                .post("/user/signup")
                .send({
                    email: "test@example.com",
                    password: "123",
                    confirmPassword: "123"
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

        it("should return 400 if the passwords do not match", async () => {
            const response = await request(app)
                .post("/user/signup")
                .send({
                    email: "test@example.com",
                    password: "12345678",
                    confirmPassword: "abcdefgh"
                })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid data",
                    details: [
                        {
                            field: "body.confirmPassword",
                            message: "Passwords do not match"
                        }
                    ]
                }
            })
        })
    })
})