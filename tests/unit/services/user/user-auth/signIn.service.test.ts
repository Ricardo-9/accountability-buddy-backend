import { describe, vi, expect, it, beforeEach } from "vitest";
import { supabase } from "../../../../../src/lib/supabase";
import { signInService } from "../../../../../src/modules/user/auth/services/signIn.service";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock("../../../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);

describe("SignIn service tests", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return data when the credentials are valid", async () => {
    const fakeData = {
      user: {
        id: "random-id",
        email: "test@example.com",
      } as User,
      session: {
        access_token: "valid-token",
      } as Session,
    };
    mockSignIn.mockResolvedValue({
      data: fakeData,
      error: null,
    });

    const result = await signInService("test@example.com", "password");

    expect(result).toEqual(fakeData);
    expect(mockSignIn).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
  });

  it("should throw an AppError when the credentials are invalid", async () => {
    mockSignIn.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "Invalid login credentials",
      } as AuthError,
    });

    const result = signInService("wrong@email.com", "wrongpass");

    await expect(result).rejects.toThrow(AppError);
    await expect(result).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
    });
  });
});
