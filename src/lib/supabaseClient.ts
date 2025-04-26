// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// For browser environments, we need to access environment variables differently
let supabaseUrl = '';
let supabaseKey = '';

// Try to access from different potential sources
if (typeof import.meta !== 'undefined' && import.meta.env) {
  // Vite
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
  supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.SUPABASE_KEY || '';
} else if (typeof window !== 'undefined' && (window as any).env) {
  // Custom window.env approach
  supabaseUrl = (window as any).env.SUPABASE_URL || '';
  supabaseKey = (window as any).env.SUPABASE_KEY || '';
} else if (typeof process !== 'undefined' && process.env) {
  // Node.js / Next.js server-side
  supabaseUrl = process.env.SUPABASE_URL || '';
  supabaseKey = process.env.SUPABASE_KEY || '';
}

// If variables are still empty, check for alternate naming conventions
if (!supabaseUrl || !supabaseKey) {
  // Try window global variables if they exist
  if (typeof window !== 'undefined') {
    supabaseUrl = (window as any).SUPABASE_URL || '';
    supabaseKey = (window as any).SUPABASE_KEY || '';
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);