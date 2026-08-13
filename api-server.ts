/**
 * api-server.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Secure Express API server for The Doom Chronicle.
 *
 * ✔ Holds SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSPHRASE, TURNSTILE_SECRET_KEY
 *   — none of these ever reach the browser bundle.
 * ✔ Verifies Cloudflare Turnstile tokens for all public write endpoints.
 * ✔ Rate-limits public write endpoints (5 req / 60 s per IP).
 * ✔ Authenticates admin routes via x-admin-passphrase header.
 * ✔ Sets Content-Security-Policy and other security headers via helmet.
 * ✔ In production, also serves the Vite static build from /dist.
 *
 * Dev:  Vite proxies /api → localhost:3001
 * Prod: Single Express process on $PORT (default 3001)
 */

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);
const isProd = process.env.NODE_ENV === 'production';

// ─── Supabase service-role client (bypasses RLS — server only) ───────────────
const supabaseUrl  = process.env.SUPABASE_URL  || '';
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('[api-server] ❌  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Check your .env file.');
}

const db = createClient(supabaseUrl, serviceKey);

// ─── Turnstile config ────────────────────────────────────────────────────────
// Hostname allowlist — set TURNSTILE_HOSTNAMES="localhost,127.0.0.1,yourdomain.com" in .env
const expectedHostnames = new Set(
  (process.env.TURNSTILE_HOSTNAMES ?? 'localhost,127.0.0.1')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean),
);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'https://challenges.cloudflare.com'],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  [
        "'self'",
        'https://*.supabase.co',
        'https://generativelanguage.googleapis.com',
        'https://challenges.cloudflare.com',
        'https://loremflickr.com',
        'https://images.unsplash.com',
      ],
      frameSrc:    ['https://challenges.cloudflare.com'],
      objectSrc:   ["'none'"],
      baseUri:     ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for external images/iframes
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://thedoomchronicle.net',
  'https://www.thedoomchronicle.net',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Rate limiters ────────────────────────────────────────────────────────────

/** General limiter: applies to all routes */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

/** Strict limiter: public write endpoints (guestbook, proposals) */
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission limit reached. Lord Doom requires a cooldown period of one minute.' },
});

/** Admin limiter: prevents brute-force on admin routes */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests. Slow down.' },
});

app.use(generalLimiter);

// ─── Middleware: Verify admin passphrase ─────────────────────────────────────
function verifyPassphrase(req: Request, res: Response, next: NextFunction): void {
  const passphrase =
    (req.headers['x-admin-passphrase'] as string) ||
    (req.body?.passphrase as string);

  const expected = process.env.ADMIN_PASSPHRASE || '';
  if (!expected) {
    res.status(500).json({ error: 'Server misconfiguration: ADMIN_PASSPHRASE not set.' });
    return;
  }
  if (passphrase !== expected) {
    res.status(401).json({ error: 'ACCESS DENIED: Invalid passphrase.' });
    return;
  }
  next();
}

// ─── Helper: Verify Cloudflare Turnstile token (canonical siteverify) ────────
async function verifyTurnstile(
  token: string,
  expectedAction: string,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET || '';

  if (!secret || secret === '<paste-your-secret-key-here>') {
    console.warn('[api-server] ⚠️  TURNSTILE_SECRET not configured. Skipping CAPTCHA verification.');
    return true;
  }

  // Basic token sanity check (per Cloudflare docs)
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return false;
  }

  if (expectedHostnames.size === 0) {
    console.warn('[api-server] ⚠️  TURNSTILE_HOSTNAMES is empty. Skipping hostname validation.');
  }

  let result: {
    success: boolean;
    action?: string;
    hostname?: string;
    'error-codes'?: string[];
  };

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
    });
    if (ip) body.set('remoteip', ip);

    const resp = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(10_000),
        body,
      },
    );

    if (!resp.ok) throw new Error(`siteverify HTTP ${resp.status}`);
    result = await resp.json() as typeof result;
  } catch (err: unknown) {
    console.error('[api-server] Turnstile siteverify error:', (err as Error).message);
    return false;
  }

  if (!result.success) {
    console.warn('[api-server] Turnstile rejected token. Error codes:', result['error-codes']);
    return false;
  }

  // Validate the action string matches what we embedded in the widget
  if (result.action !== expectedAction) {
    console.warn(`[api-server] Turnstile action mismatch: expected "${expectedAction}", got "${result.action}"`);
    return false;
  }

  // Validate hostname against allowlist (skip check if allowlist is empty)
  if (expectedHostnames.size > 0 && result.hostname && !expectedHostnames.has(result.hostname)) {
    console.warn(`[api-server] Turnstile hostname not in allowlist: "${result.hostname}"`);
    return false;
  }

  return true;
}

// ─── Helper: Server-side profanity filter ────────────────────────────────────
const badWordsConfig: Array<{ word: string; strictEnd: boolean }> = [
  { word: 'fuck',         strictEnd: false },
  { word: 'shit',         strictEnd: false },
  { word: 'bitch',        strictEnd: false },
  { word: 'cunt',         strictEnd: false },
  { word: 'asshole',      strictEnd: false },
  { word: 'pussy',        strictEnd: false },
  { word: 'bastard',      strictEnd: false },
  { word: 'faggot',       strictEnd: false },
  { word: 'nigger',       strictEnd: false },
  { word: 'kike',         strictEnd: false },
  { word: 'retard',       strictEnd: false },
  { word: 'whore',        strictEnd: false },
  { word: 'slut',         strictEnd: false },
  { word: 'motherfucker', strictEnd: false },
  { word: 'twat',         strictEnd: false },
  { word: 'wanker',       strictEnd: false },
  { word: 'chink',        strictEnd: false },
  { word: 'dyke',         strictEnd: false },
  { word: 'prick',        strictEnd: false },
  { word: 'ass',          strictEnd: true  },
  { word: 'cock',         strictEnd: true  },
  { word: 'cum',          strictEnd: true  },
];

const leetMap: Record<string, string> = {
  a: '[a@4]', e: '[e3]', i: '[i1!l]', o: '[o0]', s: '[s5$]', t: '[t7]',
};

function containsProfanity(text: string): boolean {
  const cleaned = text.toLowerCase().trim();
  for (const item of badWordsConfig) {
    const pattern = item.word
      .split('')
      .map(c => leetMap[c] ?? c)
      .join('[\\s_\\-*.]*');
    const regex = new RegExp('\\b' + pattern + (item.strictEnd ? '\\b' : ''), 'i');
    if (regex.test(cleaned)) return true;
  }
  return false;
}

function hasProfanityInFields(...fields: string[]): boolean {
  return fields.some(f => containsProfanity(f ?? ''));
}

// ─── DB helpers: same camelCase ↔ snake_case mapping as before ────────────────
function dbToApp(row: Record<string, unknown>) {
  return {
    id:             String(row.id),
    title:          String(row.title || ''),
    category:       row.category as string,
    subtitle:       String(row.subtitle || ''),
    excerpt:        String(row.excerpt || ''),
    content:        String(row.content || ''),
    publishDate:    String(row.publish_date || ''),
    readTime:       String(row.read_time || ''),
    imageUrl:       String(row.image_url || ''),
    doomRating:     Number(row.doom_rating || 0),
    doomVerdict:    String(row.doom_verdict || ''),
    slug:           String(row.slug || ''),
    featured:       Boolean(row.featured),
    status:         String(row.status || 'published'),
    authorName:     String(row.author_name || 'Dr. Doom'),
    geoRegion:      String(row.geo_region || 'Latveria'),
    seoTitle:       String(row.seo_title || ''),
    seoDescription: String(row.seo_description || ''),
    faqs:           (row.faqs as unknown[]) || [],
  };
}

function dbToGuestbook(row: Record<string, unknown>) {
  return {
    id:            String(row.id),
    name:          String(row.name || ''),
    email:         row.email ? String(row.email) : undefined,
    newsletter:    Boolean(row.newsletter),
    allegiance:    String(row.allegiance || 'loyalist'),
    country:       String(row.country || 'Latveria'),
    tribute:       String(row.tribute || ''),
    response:      row.response ? String(row.response) : undefined,
    acceptedByDoom: Boolean(row.accepted_by_doom),
    timestamp:     String(row.created_at || new Date().toISOString()),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ARTICLE ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/articles — fetch all articles (incl. drafts/pending)
app.get('/api/admin/articles', adminLimiter, verifyPassphrase, async (_req, res) => {
  try {
    const { data, error } = await db.from('articles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(dbToApp));
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/admin/articles — create article
app.post('/api/admin/articles', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const article = req.body;
    const { data, error } = await db.from('articles').insert([article]).select('*');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data returned from insert');
    res.status(201).json(dbToApp(data[0]));
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/admin/articles/:id — update article
app.put('/api/admin/articles/:id', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await db.from('articles').update(updates).eq('id', id).select('*');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Article not found');
    res.json(dbToApp(data[0]));
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/admin/articles/:id — delete article
app.delete('/api/admin/articles/:id', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('articles').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC PROPOSAL ROUTE (rate-limited + Turnstile)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/proposals — submit article proposal (public)
app.post('/api/proposals', writeLimiter, async (req, res) => {
  try {
    const { name, email, title, category, manuscript, doom_verdict, cfTurnstileToken } = req.body;

    // CAPTCHA verification
    const ip = req.headers['cf-connecting-ip'] as string || req.ip || '';
    const captchaOk = await verifyTurnstile(cfTurnstileToken || '', 'proposal', ip);
    if (!captchaOk) {
      res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
      return;
    }

    // Server-side profanity guard
    if (hasProfanityInFields(name, email, title, manuscript)) {
      res.status(400).json({ error: 'Submission contains prohibited language.' });
      return;
    }

    const id          = `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const slug        = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const publishDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const wordCount   = (manuscript || '').split(/\s+/).length;
    const readTime    = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const payload = {
      id,
      title,
      category,
      subtitle:     `Proposed by Scribe: ${name}`,
      excerpt:      manuscript.length > 150 ? `${manuscript.slice(0, 150)}...` : manuscript,
      content:      manuscript,
      image_url:    'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop',
      doom_rating:  1.0,
      doom_verdict,
      author_name:  name,
      status:       'pending_review',
      geo_region:   'Latveria',
      publish_date: publishDate,
      read_time:    readTime,
      slug,
      faqs:         [],
    };

    const { data, error } = await db.from('articles').insert([payload]).select('*');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data returned');
    res.status(201).json(dbToApp(data[0]));
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN REGISTRY (GUESTBOOK) ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// PUT /api/admin/registry/:id/response — admin reply to guestbook entry
app.put('/api/admin/registry/:id/response', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const { data, error } = await db.from('registry').update({ response }).eq('id', id).select('*');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Entry not found');
    res.json(dbToGuestbook(data[0]));
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/admin/registry/:id — delete guestbook entry
app.delete('/api/admin/registry/:id', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('registry').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC REGISTRY (GUESTBOOK) ROUTE (rate-limited + Turnstile)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/registry — submit guestbook entry (public)
app.post('/api/registry', writeLimiter, async (req, res) => {
  try {
    const { name, email, newsletter, allegiance, country, tribute, acceptedByDoom, cfTurnstileToken } = req.body;

    // CAPTCHA verification
    const ip = req.headers['cf-connecting-ip'] as string || req.ip || '';
    const captchaOk = await verifyTurnstile(cfTurnstileToken || '', 'guestbook', ip);
    if (!captchaOk) {
      res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
      return;
    }

    // Server-side profanity guard
    if (hasProfanityInFields(name, email || '', country, tribute)) {
      res.status(400).json({ error: 'CENSOR PROTOCOL ENGAGED: Prohibited language detected.' });
      return;
    }

    const id      = `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id,
      name,
      email:           email || null,
      newsletter:      newsletter || false,
      allegiance:      allegiance || 'loyalist',
      country:         country || 'Latveria',
      tribute,
      accepted_by_doom: acceptedByDoom ?? true,
    };

    const { data, error } = await db.from('registry').insert([payload]).select('*');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No data returned');
    res.status(201).json(dbToGuestbook(data[0]));
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CORPUS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/corpus — insert corpus item(s)
app.post('/api/admin/corpus', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const items: unknown[] = Array.isArray(req.body) ? req.body : [req.body];
    const { data, error } = await db.from('content_corpus').insert(items).select('*');
    if (error) throw error;
    res.status(201).json(data || []);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/admin/corpus/:id — update corpus item
app.put('/api/admin/corpus/:id', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { error } = await db.from('content_corpus').update(updates).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/admin/corpus/:id — delete single corpus item
app.delete('/api/admin/corpus/:id', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('content_corpus').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/admin/corpus — clear corpus backlog
app.delete('/api/admin/corpus', adminLimiter, verifyPassphrase, async (req, res) => {
  try {
    const { statusFilter = 'backlog' } = req.body as { statusFilter?: string };

    let query = db.from('content_corpus').select('id');
    if (statusFilter === 'backlog') {
      query = query.in('status', ['backlog']) as typeof query;
    } else if (statusFilter === 'published') {
      query = query.in('status', ['backlog', 'published']) as typeof query;
    } else {
      // 'all' — exclude in_progress items
      query = query.not('status', 'eq', 'in_progress') as typeof query;
    }

    const { data: toDelete, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;
    if (!toDelete || toDelete.length === 0) {
      res.json({ deleted: 0 });
      return;
    }

    const ids = (toDelete as Array<{ id: string }>).map(r => r.id);
    const { error: deleteErr } = await db.from('content_corpus').delete().in('id', ids);
    if (deleteErr) throw deleteErr;
    res.json({ deleted: ids.length });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC FILE SERVING (production only)
// ═══════════════════════════════════════════════════════════════════════════════
if (isProd) {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  // SPA fallback — any non-/api route serves index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛡️  Doom Chronicle API Server running on port ${PORT}`);
  console.log(`   Mode: ${isProd ? 'production' : 'development'}`);
  console.log(`   Supabase: ${supabaseUrl ? '✔ connected' : '❌ missing URL'}`);
  console.log(`   Service key: ${serviceKey ? '✔ loaded' : '❌ missing'}`);
  console.log(`   Admin passphrase: ${process.env.ADMIN_PASSPHRASE ? '✔ set' : '❌ missing'}`);
  console.log(`   Turnstile secret: ${process.env.TURNSTILE_SECRET && process.env.TURNSTILE_SECRET !== '<paste-your-secret-key-here>' ? '✔ set' : '⚠  missing (CAPTCHA skipped)'}\n`);
});
