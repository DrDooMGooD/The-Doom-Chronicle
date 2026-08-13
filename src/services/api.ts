/**
 * src/services/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Data access layer for The Doom Chronicle.
 *
 * Public reads  →  Supabase anon client (RLS enforced, safe to use client-side)
 * Admin writes  →  /api server (passphrase verified server-side, service role)
 * Public writes →  /api server (rate limited + Cloudflare Turnstile CAPTCHA)
 */

import { Article, GuestbookEntry, FAQItem } from '../types';
import { getSupabaseClient } from '../lib/supabaseClient';
import { adminGet, adminPost, adminPut, adminDel, publicPost } from '../lib/serverApi';

// ─── DB row → App model converters (shared, used for server response parsing) ─

function dbToApp(row: Record<string, unknown>): Article {
  return {
    id:             String(row.id),
    title:          String(row.title || ''),
    category:       (row.category || 'game') as 'game' | 'comic' | 'movie',
    subtitle:       String(row.subtitle || ''),
    excerpt:        String(row.excerpt || ''),
    content:        String(row.content || ''),
    publishDate:    String(row.publishDate || row.publish_date || ''),
    readTime:       String(row.readTime || row.read_time || ''),
    imageUrl:       String(row.imageUrl || row.image_url || ''),
    doomRating:     Number(row.doomRating || row.doom_rating || 0),
    doomVerdict:    String(row.doomVerdict || row.doom_verdict || ''),
    slug:           String(row.slug || ''),
    featured:       Boolean(row.featured),
    status:         ((row.status as string) || 'published') as Article['status'],
    authorName:     String(row.authorName || row.author_name || 'Dr. Doom'),
    geoRegion:      String(row.geoRegion || row.geo_region || 'Latveria'),
    seoTitle:       String(row.seoTitle || row.seo_title || ''),
    seoDescription: String(row.seoDescription || row.seo_description || ''),
    faqs:           (row.faqs as FAQItem[]) || [],
  };
}

function appToDb(article: Partial<Article>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (article.id !== undefined)             payload.id               = article.id;
  if (article.title !== undefined)          payload.title            = article.title;
  if (article.category !== undefined)       payload.category         = article.category;
  if (article.subtitle !== undefined)       payload.subtitle         = article.subtitle;
  if (article.excerpt !== undefined)        payload.excerpt          = article.excerpt;
  if (article.content !== undefined)        payload.content          = article.content;
  if (article.publishDate !== undefined)    payload.publish_date     = article.publishDate;
  if (article.readTime !== undefined)       payload.read_time        = article.readTime;
  if (article.imageUrl !== undefined)       payload.image_url        = article.imageUrl;
  if (article.doomRating !== undefined)     payload.doom_rating      = article.doomRating;
  if (article.doomVerdict !== undefined)    payload.doom_verdict     = article.doomVerdict;
  if (article.slug !== undefined)           payload.slug             = article.slug;
  if (article.featured !== undefined)       payload.featured         = article.featured;
  if (article.status !== undefined)         payload.status           = article.status;
  if (article.authorName !== undefined)     payload.author_name      = article.authorName;
  if (article.geoRegion !== undefined)      payload.geo_region       = article.geoRegion;
  if (article.seoTitle !== undefined)       payload.seo_title        = article.seoTitle;
  if (article.seoDescription !== undefined) payload.seo_description  = article.seoDescription;
  if (article.faqs !== undefined)           payload.faqs             = article.faqs;
  return payload;
}

function dbToGuestbook(row: Record<string, unknown>): GuestbookEntry {
  return {
    id:             String(row.id),
    name:           String(row.name || ''),
    email:          row.email ? String(row.email) : undefined,
    newsletter:     Boolean(row.newsletter),
    allegiance:     (row.allegiance || 'loyalist') as GuestbookEntry['allegiance'],
    country:        String(row.country || 'Latveria'),
    tribute:        String(row.tribute || ''),
    response:       row.response ? String(row.response) : undefined,
    acceptedByDoom: Boolean(row.acceptedByDoom ?? row.accepted_by_doom),
    timestamp:      String(row.timestamp || row.created_at || new Date().toISOString()),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC READS — Supabase anon client (safe, RLS enforced)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchArticles(): Promise<Article[]> {
  const client = getSupabaseClient() as ReturnType<typeof import('@supabase/supabase-js').createClient> | null;
  if (!client) return [];
  const { data, error } = await (client as any)
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const articles = ((data as Record<string, unknown>[]) || []).map(dbToApp);
  return articles.sort((a, b) => {
    const tA = Date.parse(a.publishDate) || 0;
    const tB = Date.parse(b.publishDate) || 0;
    return tB - tA;
  });
}

export async function fetchRegistryEntries(): Promise<GuestbookEntry[]> {
  const client = getSupabaseClient() as any;
  if (!client) return [];
  const { data, error } = await client
    .from('registry')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) || []).map(dbToGuestbook);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN READS — via API server (with client-side fallback if server offline)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchAdminArticles(): Promise<Article[]> {
  try {
    const rows = await adminGet<Record<string, unknown>[]>('/admin/articles');
    const articles = rows.map(dbToApp);
    return articles.sort((a, b) => {
      const tA = Date.parse(a.publishDate) || 0;
      const tB = Date.parse(b.publishDate) || 0;
      return tB - tA;
    });
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) return [];
      const { data, error } = await client.from('articles').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      const articles = ((data as Record<string, unknown>[]) || []).map(dbToApp);
      return articles.sort((a, b) => {
        const tA = Date.parse(a.publishDate) || 0;
        const tB = Date.parse(b.publishDate) || 0;
        return tB - tA;
      });
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN WRITES — via API server (with client-side fallback if server offline)
// ═══════════════════════════════════════════════════════════════════════════════

export async function createArticle(article: Partial<Article>): Promise<Article> {
  const id          = article.id || `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug        = article.slug || (article.title
    ? article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : 'untitled');
  const publishDate = article.publishDate || new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const readTime    = article.readTime ||
    `${Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 200))} min read`;

  const payload = appToDb({ ...article, id, slug, publishDate, readTime });

  try {
    const row = await adminPost<Record<string, unknown>>('/admin/articles', payload);
    return dbToApp(row);
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) throw new Error('Database client not initialized');
      const { data, error } = await client.from('articles').insert([payload]).select('*');
      if (error) throw new Error(error.message);
      return dbToApp(data[0]);
    }
    throw err;
  }
}

export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
  const payload = appToDb(updates);
  try {
    const row = await adminPut<Record<string, unknown>>(`/admin/articles/${id}`, payload);
    return dbToApp(row);
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) throw new Error('Database client not initialized');
      const { data, error } = await client.from('articles').update(payload).eq('id', id).select('*');
      if (error) throw new Error(error.message);
      return dbToApp(data[0]);
    }
    throw err;
  }
}

export async function deleteArticle(id: string): Promise<void> {
  try {
    await adminDel(`/admin/articles/${id}`);
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) throw new Error('Database client not initialized');
      const { data, error } = await client.from('articles').delete().eq('id', id).select('*');
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        throw new Error('Supabase RLS policy is blocking DELETE on articles table. Please run the RLS DELETE policy in Supabase SQL Editor.');
      }
      return;
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC WRITES — via API server (with client-side fallback if server offline)
// ═══════════════════════════════════════════════════════════════════════════════

export async function submitProposal(proposal: {
  name: string;
  email: string;
  title: string;
  category: 'game' | 'comic' | 'movie';
  manuscript: string;
  doom_verdict: string;
  cfTurnstileToken?: string;
}): Promise<Article> {
  try {
    const row = await publicPost<Record<string, unknown>>('/proposals', proposal);
    return dbToApp(row);
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) throw new Error('Database client not initialized');
      const id = `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const slug = proposal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const publishDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const wordCount = (proposal.manuscript || '').split(/\s+/).length;
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

      const payload = {
        id,
        title: proposal.title,
        category: proposal.category,
        subtitle: `Proposed by Scribe: ${proposal.name}`,
        excerpt: proposal.manuscript.length > 150 ? `${proposal.manuscript.slice(0, 150)}...` : proposal.manuscript,
        content: proposal.manuscript,
        image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop',
        doom_rating: 1.0,
        doom_verdict: proposal.doom_verdict,
        author_name: proposal.name,
        status: 'pending_review',
        geo_region: 'Latveria',
        publish_date: publishDate,
        read_time: readTime,
        slug,
        faqs: [],
      };

      const { data, error } = await client.from('articles').insert([payload]).select('*');
      if (error) throw new Error(error.message);
      return dbToApp(data[0]);
    }
    throw err;
  }
}

export async function submitRegistryEntry(
  entry: Partial<GuestbookEntry> & { cfTurnstileToken?: string }
): Promise<GuestbookEntry> {
  try {
    const row = await publicPost<Record<string, unknown>>('/registry', entry);
    return dbToGuestbook(row);
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) throw new Error('Database client not initialized');
      const id = `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        id,
        name: entry.name,
        email: entry.email || null,
        newsletter: entry.newsletter || false,
        allegiance: entry.allegiance || 'loyalist',
        country: entry.country || 'Latveria',
        tribute: entry.tribute,
        accepted_by_doom: entry.acceptedByDoom ?? true,
      };
      const { data, error } = await client.from('registry').insert([payload]).select('*');
      if (error) throw new Error(error.message);
      return dbToGuestbook(data[0]);
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN REGISTRY OPERATIONS — via API server (with client-side fallback)
// ═══════════════════════════════════════════════════════════════════════════════

export async function respondToRegistryEntry(
  id: string,
  responseText: string,
): Promise<GuestbookEntry> {
  try {
    const row = await adminPut<Record<string, unknown>>(
      `/admin/registry/${id}/response`,
      { response: responseText },
    );
    return dbToGuestbook(row);
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) throw new Error('Database client not initialized');
      const { data, error } = await client.from('registry').update({ response: responseText }).eq('id', id).select('*');
      if (error) throw new Error(error.message);
      return dbToGuestbook(data[0]);
    }
    throw err;
  }
}

export async function deleteRegistryEntry(id: string): Promise<void> {
  try {
    await adminDel(`/admin/registry/${id}`);
  } catch (err: any) {
    if (err.message === 'API_SERVER_OFFLINE') {
      const client = getSupabaseClient() as any;
      if (!client) throw new Error('Database client not initialized');
      const { data, error } = await client.from('registry').delete().eq('id', id).select('*');
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        throw new Error('Supabase RLS policy is blocking DELETE on registry table. Please run the RLS DELETE policy in Supabase SQL Editor.');
      }
      return;
    }
    throw err;
  }
}
