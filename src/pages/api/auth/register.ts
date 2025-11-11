import type { APIRoute } from "astro";
import { registerSchema } from "@/lib/schemas/auth.schema";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
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
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data, error } = await locals.supabase.auth.signUp({
      email: validatedData.data.email,
      password: validatedData.data.password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        return new Response(JSON.stringify({ error: "User with this email already exists." }), {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const isRateLimit =
        error.message.includes("rate limit") ||
        error.message.includes("Email rate limit exceeded") ||
        error.message.includes("too many requests");

      if (isRateLimit) {
        return new Response(
          JSON.stringify({
            error:
              "Email rate limit reached. Please wait an hour or use a different email address (e.g., yourname+test@gmail.com).",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: "User created successfully. Please check your email to verify your account.",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
