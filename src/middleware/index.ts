import { defineMiddleware } from 'astro:middleware';

import { supabaseAdmin } from '../db/supabase.client.ts';

export const onRequest = defineMiddleware((context, next) => {
  // Use admin client for server-side operations (bypasses RLS)
  // This is safe because we're on the server and validate user_id in our code
  context.locals.supabase = supabaseAdmin;
  return next();
});

