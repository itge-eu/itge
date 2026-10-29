import {
  createClient,
} from "@supabase/supabase-js"

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY

// Auth-aware client.
// Keep this for login, admin functionality and authenticated writes.
export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey,
  )

// Public read-only client.
// This never persists or refreshes a user's authenticated session.
export const publicSupabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  )