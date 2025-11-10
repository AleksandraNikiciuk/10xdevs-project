import type { APIRoute } from "astro";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  const validatedData = forgotPasswordSchema.safeParse({
    email,
  });

  if (!validatedData.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid email address",
        details: validatedData.error.flatten(),
      }),
      { status: 400 }
    );
  }

  const { error } = await locals.supabase.auth.resetPasswordForEmail(validatedData.data.email, {
    redirectTo: `${new URL(request.url).origin}/reset-password`,
  });

  if (error) {
    // To prevent user enumeration, we'll return a success response even if the user does not exist.
    if (error.message.includes("User not found")) {
      return new Response(
        JSON.stringify({
          message: "If an account with this email exists, a password reset link has been sent.",
        }),
        { status: 200 }
      );
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({
      message: "If an account with this email exists, a password reset link has been sent.",
    }),
    { status: 200 }
  );
};
