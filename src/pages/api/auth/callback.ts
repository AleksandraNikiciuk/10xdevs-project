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

    // Set cookies with environment-aware configuration
    console.log("[CALLBACK] Setting cookies for user:", user.id);

    // Detect if we're in production (HTTPS)
    const isProduction = request.url.startsWith("https://");
    console.log("[CALLBACK] Is production:", isProduction);

    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    // Set cookies using Astro's cookie API
    cookies.set("sb-access-token", access_token, cookieOptions);
    cookies.set("sb-refresh-token", refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
    });

    console.log("[CALLBACK] Cookies set successfully");
    console.log("[CALLBACK] Cookie options used:", cookieOptions);
    console.log("[CALLBACK] Request URL:", request.url);
    console.log("[CALLBACK] Request origin:", new URL(request.url).origin);

    // Build Set-Cookie headers manually as a backup
    const buildCookieString = (name: string, value: string, maxAge: number) => {
      const parts = [`${name}=${value}`, `Path=/`, `Max-Age=${maxAge}`, `SameSite=Lax`];
      if (isProduction) {
        parts.push("Secure");
      }
      parts.push("HttpOnly");
      return parts.join("; ");
    };

    const headers = new Headers({
      "Content-Type": "application/json",
      "Set-Cookie": buildCookieString("sb-access-token", access_token, 60 * 60 * 24 * 7),
    });
    headers.append("Set-Cookie", buildCookieString("sb-refresh-token", refresh_token, 60 * 60 * 24 * 30));

    return new Response(
      JSON.stringify({
        message: "Session created successfully",
        user: {
          id: user.id,
          email: user.email,
        },
        debug: {
          isProduction,
          cookieSecure: cookieOptions.secure,
          origin: new URL(request.url).origin,
        },
      }),
      {
        status: 200,
        headers,
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
