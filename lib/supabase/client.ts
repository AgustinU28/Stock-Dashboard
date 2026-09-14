import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your project's values."
  );
}

// This project has no auth (see supabase/migrations/0001_init_schema.sql), so a
// single anon-key client is safe to share between server reads and the browser's
// realtime subscriptions — there is no per-user session state to isolate.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
