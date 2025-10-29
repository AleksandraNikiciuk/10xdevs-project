import type { APIRoute } from "astro";
import { supabaseAdmin } from "@/db/supabase.client";
import { registerSchema } from "@/lib/schemas/auth.schema";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  const validatedData = registerSchema.safeParse({
    email,
    password,
    confirmPassword,
  });

  if (!validatedData.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid data",
        details: validatedData.error.flatten(),
      }),
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.auth.signUp({
    email: validatedData.data.email,
    password: validatedData.data.password,
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists." }),
        { status: 409 }
      );
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (data.session) {
    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, {
      path: "/",
    });
    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
    });
    return new Response(JSON.stringify({ message: "User created and logged in successfully" }), {
      status: 201,
    });
  }

  return new Response(
    JSON.stringify({
      message: "User created successfully. Please check your email to verify your account.",
    }),
    { status: 201 }
  );
};
