import { AppError } from "../../../../core/errors/AppError.js";
import { supabase } from "../../../../lib/supabase.js";

export async function signInService(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error)
    throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);

  return data;
}
