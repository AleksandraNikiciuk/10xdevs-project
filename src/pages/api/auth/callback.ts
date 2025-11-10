import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    console.log("[CALLBACK] Starting callback process");

    const body = await request.json();
    const { access_token, refresh_token } = body;

    console.log("[CALLBACK] Has access_token:", !!access_token);
    console.log("[CALLBACK] Has refresh_token:", !!refresh_token);

    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({
          error: "Missing tokens",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await locals.supabase.auth.getUser(access_token);

    console.log("[CALLBACK] User verification result:", { hasUser: !!user, hasError: !!error });

    if (error || !user) {
      console.error("[CALLBACK] Error verifying user:", error?.message);
      return new Response(
        JSON.stringify({
          error: "Invalid token",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Set cookies
    console.log("[CALLBACK] Setting cookies for user:", user.id);
    cookies.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log("[CALLBACK] Cookies set successfully");

    return new Response(
      JSON.stringify({
        message: "Session created successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[CALLBACK] Unexpected error:", error);
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
