import { defineMiddleware } from "astro:middleware";

import { createSupabaseClient } from "../db/supabase.client.ts";

const protectedRoutes = ["/flashcards", "/manual-create"];
const authRoutes = ["/login", "/register", "/forgot-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client with env vars
  // In Cloudflare Pages production: use context.locals.runtime.env
  // In development: use import.meta.env

  // Debug logging to see what's available
  console.log("Runtime exists:", !!context.locals.runtime);
  console.log("Runtime env exists:", !!context.locals.runtime?.env);

  const env = context.locals.runtime?.env || {
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
  };

  console.log("SUPABASE_URL available:", !!env.SUPABASE_URL);
  console.log("SUPABASE_URL starts with:", env.SUPABASE_URL?.substring(0, 20));
  console.log("SUPABASE_KEY available:", !!env.SUPABASE_KEY);
  console.log("SUPABASE_KEY starts with:", env.SUPABASE_KEY?.substring(0, 10));

  // Use anon key for standard operations (respects RLS)
  context.locals.supabase = createSupabaseClient({
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_KEY: env.SUPABASE_KEY,
  });

  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  if (accessToken && refreshToken) {
    // Set the session on the supabase client so all DB operations use the user's credentials
    const { data: sessionData, error: sessionError } = await context.locals.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.error("Failed to set session:", sessionError);
      context.locals.user = null;
    } else if (sessionData.user) {
      context.locals.user = sessionData.user;

      // Update cookies with latest tokens if session was refreshed
      if (sessionData.session) {
        const { access_token, refresh_token } = sessionData.session;
        context.cookies.set("sb-access-token", access_token, { path: "/" });
        context.cookies.set("sb-refresh-token", refresh_token, { path: "/" });
      }
    } else {
      context.locals.user = null;
    }
  } else {
    context.locals.user = null;
  }

  const currentRoute = context.url.pathname;

  if (protectedRoutes.includes(currentRoute) && !context.locals.user) {
    return context.redirect("/login");
  }

  if (authRoutes.includes(currentRoute) && context.locals.user) {
    return context.redirect("/generate");
  }

  return next();
});
