import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body;

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

    const {
      data: { user },
      error,
    } = await locals.supabase.auth.getUser(access_token);

    if (error || !user) {
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

    const isProduction = request.url.startsWith("https://");

    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    cookies.set("sb-access-token", access_token, cookieOptions);
    cookies.set("sb-refresh-token", refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Set cookies via headers as backup
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
      }),
      {
        status: 200,
        headers,
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
