import { AppError } from "../../../core/errors/AppError.js";
import { supabase } from "../../../lib/supabase.js";

export async function signupService(
    email: string,
    password: string
) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    })

    if (error) throw new AppError("AUTH_ERROR", error.message)

    if (!data.user) throw new AppError("AUTH_ERROR", "User creation failed")
        
    return data.user
}