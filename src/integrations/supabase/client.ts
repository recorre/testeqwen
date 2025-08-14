// Environment-aware Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment-based configuration with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gxakqwmxnkjiruykrvwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4YWtxd214bmtqaXJ1eWtydndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzIxNDAsImV4cCI6MjA3MDc0ODE0MH0.H_CZE3g414SP-0rn8B4glxMdekIYU6xpEyt0jBo-42k";

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});