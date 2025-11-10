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
      const result = await locals.supabase.auth.signUp({
        email: validatedData.data.email,
        password: validatedData.data.password,
      });
      data = result.data;
      error = result.error;
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
      if (error.message.includes("User already registered")) {
        return new Response(JSON.stringify({ error: "User with this email already exists." }), {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        });
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
