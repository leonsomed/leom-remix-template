import { SUPABASE_CONFIG } from "~/server/serverConfig";
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  typeof window === "undefined"
    ? SUPABASE_CONFIG.PROJECT_URL
    : window.ENV.SUPABASE_PROJECT_URL,
  typeof window === "undefined"
    ? SUPABASE_CONFIG.PUBLIC_ANON_KEY
    : window.ENV.SUPABASE_PUBLIC_ANON_KEY,
  {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
    },
  },
);
