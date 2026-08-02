import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://godprvhlyptnzonotejj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZHBydmhseXB0bnpvbm90ZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTMyMDksImV4cCI6MjEwMTE2OTIwOX0.ImiUZBPRjcBf7yV64iiw5W-4sSXGV1W1UFjhMNx5mLc';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
