import { describe, vi, expect, it, beforeEach } from "vitest"
import { supabase } from "../../../src/lib/supabase"
import { signupService } from "../../../src/modules/user/auth/services/signup.service"
import { AuthError, User } from "@supabase/supabase-js"

vi.mock("../../../src/lib/supabase", () => ({
    supabase: {
        auth: {
            signUp: vi.fn()
        }
    }
}))

const mockSignUp = vi.mocked(supabase.auth.signUp)

describe("Signup service test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should return the created user", async () => {
        const fakeUser = {
            id: "random-id",
            email: "test@example.com"
        } as User

        mockSignUp.mockResolvedValue({
            data: {
                user: fakeUser,
                session: null
            },
            error: null
        })

        const result = await signupService("test@example.com", "password")

        expect(result).toEqual(fakeUser)
        expect(mockSignUp).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "password"
        })
    })

    it("should throw an AppError when the Supabase returns an error", async () => {
        mockSignUp.mockResolvedValue({
            data: {
                user: null,
                session: null
            },
            error: {
                message: "User already registered"
            } as AuthError
        })

        await expect(signupService("test@example.com", "password")).rejects.toMatchObject({
            code: "AUTH_ERROR",
            message: "User already registered"
        })
    })

    it("should throw an AppError when the data.user is null", async () => {
        mockSignUp.mockResolvedValue({
            data: {
                user: null,
                session: null
            },
            error: null
        })

        await expect(signupService("test@example.com", "password")).rejects.toMatchObject({
            code: "AUTH_ERROR",
            message: "User creation failed"
        })
    })
})