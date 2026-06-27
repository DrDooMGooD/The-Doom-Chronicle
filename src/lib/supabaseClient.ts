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
