import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Email is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Resend confirmation email
    const { data, error } = await locals.supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (error) {
      // Check if it's a rate limit error
      const isRateLimit =
        error.message.includes("rate limit") ||
        error.message.includes("Email rate limit exceeded") ||
        error.message.includes("too many requests");

      return new Response(
        JSON.stringify({
          error: error.message,
          isRateLimit,
          hint: isRateLimit
            ? "Please wait an hour before requesting another verification email. Check your spam folder in case the email was already sent."
            : undefined,
        }),
        {
          status: isRateLimit ? 429 : 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Verification email sent successfully",
        data,
      }),
      {
        status: 200,
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
