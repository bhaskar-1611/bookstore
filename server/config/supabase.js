import dotenv from "dotenv"
dotenv.config()

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing")
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing")
}

if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is missing")
}

// Used for ALL database operations from the Express backend.
// Keep this client isolated from user auth/session operations.
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
)

// Used ONLY for Supabase Auth operations such as
// signInWithPassword, signUp and refreshSession.
export const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
)

// Backwards compatibility:
// Existing routes that import `supabase` continue using
// the service-role database client.
export default supabaseAdmin