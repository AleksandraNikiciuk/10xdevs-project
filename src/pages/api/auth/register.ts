import type { APIRoute } from "astro";
import { registerSchema } from "@/lib/schemas/auth.schema";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    console.log("[REGISTER] Starting registration process");

    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    console.log("[REGISTER] Form data received, email:", email);

    const validatedData = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    console.log("[REGISTER] Validation result:", validatedData.success);
    console.log("[REGISTER] Supabase client available:", !!locals.supabase);
    console.log("[REGISTER] Supabase auth available:", !!locals.supabase?.auth);

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

    let data, error;
    try {
      console.log("[REGISTER] About to call signUp");
      const result = await locals.supabase.auth.signUp({
        email: validatedData.data.email,
        password: validatedData.data.password,
        options: {
          emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        },
      });
      console.log("[REGISTER] signUp completed");
      data = result.data;
      error = result.error;
      console.log("[REGISTER] Has error:", !!error);
      console.log("[REGISTER] Has data:", !!data);
      console.log("[REGISTER] Has session:", !!data?.session);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Failed to connect to authentication service",
          details: err instanceof Error ? err.message : String(err),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (error) {
      console.log("[REGISTER] Error from Supabase:", error.message);
      if (error.message.includes("User already registered")) {
        return new Response(JSON.stringify({ error: "User with this email already exists." }), {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      // Check for rate limit
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
      console.log("[REGISTER] User has session, setting cookies");
      const { access_token, refresh_token } = data.session;
      console.log("[REGISTER] Setting sb-access-token cookie");
      cookies.set("sb-access-token", access_token, {
        path: "/",
      });
      console.log("[REGISTER] Setting sb-refresh-token cookie");
      cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
      });
      console.log("[REGISTER] Returning success response");
      return new Response(JSON.stringify({ message: "User created and logged in successfully" }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log("[REGISTER] No session, returning email verification response");
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
    console.error("[REGISTER] Unexpected error:", error);
    console.error("[REGISTER] Error details:", error instanceof Error ? error.message : String(error));
    console.error("[REGISTER] Error stack:", error instanceof Error ? error.stack : "No stack");
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
