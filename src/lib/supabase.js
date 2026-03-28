// Import the function that creates a Supabase client instance
import { createClient } from '@supabase/supabase-js'

// Get the Supabase URL and anon key from environment variables
// These are stored in ..env.local and never hardcoded for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create and export the Supabase client
// This single instance is shared across the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)