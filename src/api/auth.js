// src/api/auth.js
import { supabase } from "../supabaseClient";

const normalizeEmail = (value) => {
  const cleaned = value?.trim();
  if (!cleaned) return "";
  return cleaned.includes("@") ? cleaned : `${cleaned}@splitpay.local`;
};

export const loginUser = async (usernameOrEmail, password) => {
  try {
    const email = normalizeEmail(usernameOrEmail);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return error.message || "Invalid username or password";
    }

    return "Success";
  } catch (err) {
    console.error(err);
    return "Error connecting to server";
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const authEmail = normalizeEmail(email || username);

    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
    });

    if (error) {
      return error.message || "Registration failed";
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          username,
          email: authEmail,
        },
      ]);

      if (profileError) {
        console.error("Failed to create profile", profileError);
        // Maybe delete the user or handle
      }
    }

    return "Success";
  } catch (err) {
    console.error(err);
    return "Error connecting to server";
  }
};