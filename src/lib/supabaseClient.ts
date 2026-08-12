import { createClient } from '@supabase/supabase-js';

// Retrieve credentials with a robust lookup sequence (env variables -> localStorage fallback)
export function getSupabaseConfig() {
  let url = '';
  let anonKey = '';

  try {
    url = (import.meta as any).env.VITE_SUPABASE_URL || '';
    anonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';
  } catch (err) {
    console.warn('Vite env not loaded yet:', err);
  }

  // Fallback to local storage for quick UI testing or instant sandbox setup
  if (!url || !anonKey) {
    try {
      url = localStorage.getItem('supabase-url') || url;
      anonKey = localStorage.getItem('supabase-anon-key') || anonKey;
    } catch (err) {
      console.warn('LocalStorage not accessible:', err);
    }
  }

  // Node environment process.env fallback (for CLI tools & runners)
  if (!url || !anonKey) {
    try {
      url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || url;
      anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || anonKey;
    } catch {}
  }

  // No hardcoded fallback — credentials must be set via environment variables.
  // Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (never commit them).

  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
  };
}

// Lazy initializer to prevent app crashes on boot if keys are missing
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, anonKey);
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Reset instance when credentials are changed in-app
export function resetSupabaseInstance() {
  supabaseInstance = null;
}
