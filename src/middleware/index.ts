import { defineMiddleware } from "astro:middleware";

import { supabaseAdmin } from "../db/supabase.client.ts";

const protectedRoutes = ["/flashcards", "/manual-create"];
const authRoutes = ["/login", "/register", "/forgot-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  // Use admin client for server-side operations (bypasses RLS)
  // This is safe because we're on the server and validate user_id in our code
  context.locals.supabase = supabaseAdmin;

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
