import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, locals }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        message: "No session found",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const {
    data: { user },
    error,
  } = await locals.supabase.auth.getUser(accessToken);

  if (error || !user) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        message: "Invalid session",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
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
};
