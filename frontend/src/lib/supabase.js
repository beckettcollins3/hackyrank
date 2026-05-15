import { createClient } from "@supabase/supabase-js";

// Public project values for HackyRank.
// These are the Supabase URL and the *publishable / anon* API key — both are
// designed by Supabase to ship in client bundles. Security is enforced by RLS
// + auth tokens, not by hiding this key. Override with Vite env vars in any
// environment where you want a different project (e.g. preview, staging).
const FALLBACK_SUPABASE_URL = "https://gcecympcihbpnaxnbcmo.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "sb_publishable_316iKjYsBo-drOSxYRgwvA_eqVSQhBU";

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Surface init problems loudly. supabaseInitError is read by AuthContext to
// render a banner so the user sees something actionable rather than a silent
// "Couldn't load feed" message.
export let supabaseInitError = null;

if (!url || !anon) {
  supabaseInitError =
    "Supabase env vars missing and no fallback compiled in. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
  // eslint-disable-next-line no-console
  console.error("[hackyrank]", supabaseInitError);
}

export const supabase = createClient(
  url ?? FALLBACK_SUPABASE_URL,
  anon ?? FALLBACK_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Helpful at runtime to confirm which project the bundle is talking to
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.info("[hackyrank] Supabase →", url);
}
