import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const missingSupabaseEnvVars = [
  !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
  !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
].filter(Boolean) as string[];

export const isSupabaseConfigured = missingSupabaseEnvVars.length === 0;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export default supabase;
