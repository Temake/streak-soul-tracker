
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ktqtyrxrdkylgftqpclo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cXR5cnhyZGt5bGdmdHFwY2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTEyNzAsImV4cCI6MjA1NzUyNzI3MH0.0oRhpAfgMebSblyDP73dEBK6zWeTlZJSp4p7tMdLimY";

// Get the current URL of the application
const getRedirectURL = () => {
  // In production, use the current origin
  // In development, use localhost:5173 (or your dev server)
  return window.location.origin + '/login';
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Use the appropriate property for redirection in the Auth config
      redirectTo: getRedirectURL()
    }
  }
);
