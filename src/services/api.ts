import { Article } from '../types';
import { getSupabaseClient } from '../lib/supabaseClient';

const getExpectedPasscode = () => {
  return (import.meta as any).env.VITE_ADMIN_PASSPHRASE || 'latveria';
};

// Helper to convert DB keys (snake_case) to Frontend keys (camelCase)
function dbToApp(row: any): Article {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    category: (row.category || 'game') as 'game' | 'comic' | 'movie',
    subtitle: String(row.subtitle || ''),
    excerpt: String(row.excerpt || ''),
    content: String(row.content || ''),
    publishDate: String(row.publishDate || row.publish_date || ''),
    readTime: String(row.readTime || row.read_time || ''),
    imageUrl: String(row.imageUrl || row.image_url || ''),
    doomRating: Number(row.doomRating || row.doom_rating || 0),
    doomVerdict: String(row.doomVerdict || row.doom_verdict || ''),
    slug: String(row.slug || ''),
    featured: Boolean(row.featured),
    status: row.status || 'published',
    authorName: row.authorName || row.author_name || 'Dr. Doom',
    geoRegion: row.geoRegion || row.geo_region || 'Latveria',
    seoTitle: row.seoTitle || row.seo_title || '',
    seoDescription: row.seoDescription || row.seo_description || '',
    faqs: row.faqs || []
  };
}

// Helper to convert Frontend keys (camelCase) to DB keys (snake_case)
function appToDb(article: Partial<Article>) {
  const payload: any = {};
  if (article.id !== undefined) payload.id = article.id;
  if (article.title !== undefined) payload.title = article.title;
  if (article.category !== undefined) payload.category = article.category;
  if (article.subtitle !== undefined) payload.subtitle = article.subtitle;
  if (article.excerpt !== undefined) payload.excerpt = article.excerpt;
  if (article.content !== undefined) payload.content = article.content;
  if (article.publishDate !== undefined) payload.publish_date = article.publishDate;
  if (article.readTime !== undefined) payload.read_time = article.readTime;
  if (article.imageUrl !== undefined) payload.image_url = article.imageUrl;
  if (article.doomRating !== undefined) payload.doom_rating = article.doomRating;
  if (article.doomVerdict !== undefined) payload.doom_verdict = article.doomVerdict;
  if (article.slug !== undefined) payload.slug = article.slug;
  if (article.featured !== undefined) payload.featured = article.featured;
  if (article.status !== undefined) payload.status = article.status;
  if (article.authorName !== undefined) payload.author_name = article.authorName;
  if (article.geoRegion !== undefined) payload.geo_region = article.geoRegion;
  if (article.seoTitle !== undefined) payload.seo_title = article.seoTitle;
  if (article.seoDescription !== undefined) payload.seo_description = article.seoDescription;
  if (article.faqs !== undefined) payload.faqs = article.faqs;
  return payload;
}

export async function fetchArticles(): Promise<Article[]> {
  const client = getSupabaseClient() as any;
  if (!client) return [];
  const { data, error } = await client
    .from('articles')
    .select('*')
    .eq('status', 'published');
  if (error) throw new Error(error.message);
  return (data || []).map(dbToApp);
}

export async function fetchAdminArticles(passcode: string): Promise<Article[]> {
  if (passcode !== getExpectedPasscode()) {
    throw new Error('ACCESS DENIED: Unauthorized Passcode');
  }
  const client = getSupabaseClient() as any;
  if (!client) return [];
  const { data, error } = await client
    .from('articles')
    .select('*');
  if (error) throw new Error(error.message);
  return (data || []).map(dbToApp);
}

export async function createArticle(article: Partial<Article>, passcode: string): Promise<Article> {
  if (passcode !== getExpectedPasscode()) {
    throw new Error('ACCESS DENIED: Unauthorized Passcode');
  }
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');

  const id = article.id || `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = article.slug || (article.title ? article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'untitled');
  const publishDate = article.publishDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const readTime = article.readTime || `${Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 200))} min read`;

  const dbPayload = appToDb({
    ...article,
    id,
    slug,
    publishDate,
    readTime
  });

  const { data, error } = await client
    .from('articles')
    .insert([dbPayload])
    .select('*');

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No data returned from insert');
  return dbToApp(data[0]);
}

export async function updateArticle(id: string, updates: Partial<Article>, passcode: string): Promise<Article> {
  if (passcode !== getExpectedPasscode()) {
    throw new Error('ACCESS DENIED: Unauthorized Passcode');
  }
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');

  const dbPayload = appToDb(updates);
  const { data, error } = await client
    .from('articles')
    .update(dbPayload)
    .eq('id', id)
    .select('*');

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No data returned from update');
  return dbToApp(data[0]);
}

export async function deleteArticle(id: string, passcode: string): Promise<void> {
  if (passcode !== getExpectedPasscode()) {
    throw new Error('ACCESS DENIED: Unauthorized Passcode');
  }
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');

  const { error } = await client
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function submitProposal(proposal: {
  name: string;
  email: string;
  title: string;
  category: 'game' | 'comic' | 'movie';
  manuscript: string;
  doom_verdict: string;
}): Promise<Article> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');

  const id = `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = proposal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const publishDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const readTime = `${Math.max(1, Math.ceil(proposal.manuscript.split(/\s+/).length / 200))} min read`;

  const articlePayload: Partial<Article> = {
    id,
    title: proposal.title,
    category: proposal.category,
    subtitle: `Proposed by Scribe: ${proposal.name}`,
    excerpt: proposal.manuscript.length > 150 ? `${proposal.manuscript.slice(0, 150)}...` : proposal.manuscript,
    content: proposal.manuscript,
    imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop',
    doomRating: 1.0,
    doomVerdict: proposal.doom_verdict,
    authorName: proposal.name,
    status: 'pending_review',
    geoRegion: 'Latveria',
    publishDate,
    readTime,
    faqs: []
  };

  const dbPayload = appToDb(articlePayload);
  const { data, error } = await client
    .from('articles')
    .insert([dbPayload])
    .select('*');

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No data returned from submitProposal');
  return dbToApp(data[0]);
}
