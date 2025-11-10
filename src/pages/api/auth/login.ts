import type { APIRoute } from "astro";
import { loginSchema } from "@/lib/schemas/auth.schema";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const validatedData = loginSchema.safeParse({
    email,
    password,
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

  const { data, error } = await locals.supabase.auth.signInWithPassword({
    email: validatedData.data.email,
    password: validatedData.data.password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
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
  }

  return new Response(JSON.stringify({ message: "Logged in successfully" }), {
    status: 200,
  });
};
