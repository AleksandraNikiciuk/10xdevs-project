import { defineMiddleware } from "astro:middleware";

import { createSupabaseAdmin } from "../db/supabase.client.ts";

const protectedRoutes = ["/flashcards", "/manual-create"];
const authRoutes = ["/login", "/register", "/forgot-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client with env vars
  // With Astro 5 env schema, import.meta.env is available both in dev and production (Cloudflare)
  context.locals.supabase = createSupabaseAdmin({
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  if (accessToken && refreshToken) {
    const {
      data: { user },
    } = await context.locals.supabase.auth.getUser(accessToken);

    if (user) {
      context.locals.user = user;
    } else {
      const { data } = await context.locals.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      if (data.user) {
        context.locals.user = data.user;
        // Update cookies if needed
        if (data.session) {
          const { access_token, refresh_token } = data.session;
          context.cookies.set("sb-access-token", access_token, { path: "/" });
          context.cookies.set("sb-refresh-token", refresh_token, { path: "/" });
        }
      } else {
        context.locals.user = null;
      }
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
