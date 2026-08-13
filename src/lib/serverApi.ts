/**
 * serverApi.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP client for calling the Doom Chronicle API server (/api routes).
 *
 * - In development, Vite proxies /api → localhost:3001
 * - In production, /api routes are handled by the same Express server
 *   that serves the static build (same origin, no CORS issue)
 *
 * All admin requests automatically attach the passphrase from localStorage.
 */

const BASE = '/api';

/** Retrieve the admin passphrase from localStorage (set by CMSDashboard). */
function getPassphrase(): string {
  try {
    return localStorage.getItem('castle_passcode') || '';
  } catch {
    return '';
  }
}

/** Generic fetch helper with consistent error handling. */
async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  isAdmin = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isAdmin) {
    headers['x-admin-passphrase'] = getPassphrase();
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json() as { error?: string };
      if (err.error) message = err.error;
    } catch { /* ignore parse error */ }
    throw new Error(message);
  }

  // 204 No Content or empty body
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ─── Admin helpers ────────────────────────────────────────────────────────────
export const adminGet  = <T>(path: string)                    => request<T>('GET',    path, undefined, true);
export const adminPost = <T>(path: string, body: unknown)     => request<T>('POST',   path, body,      true);
export const adminPut  = <T>(path: string, body: unknown)     => request<T>('PUT',    path, body,      true);
export const adminDel  = <T>(path: string, body?: unknown)    => request<T>('DELETE', path, body,      true);

// ─── Public helpers (no auth, but may include Turnstile token in body) ────────
export const publicPost = <T>(path: string, body: unknown)    => request<T>('POST',   path, body,      false);
