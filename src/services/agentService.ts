import { getSupabaseClient } from '../lib/supabaseClient';
import { CorpusItem } from '../types';

export async function fetchCorpusEntries(): Promise<CorpusItem[]> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');
  const { data, error } = await client
    .from('content_corpus')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function deleteCorpusItem(id: string): Promise<void> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');
  const { error } = await client
    .from('content_corpus')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateCorpusItem(
  id: string,
  updates: { notes?: string; title?: string; status?: string; published_url?: string | null }
): Promise<void> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');
  const { error } = await client
    .from('content_corpus')
    .update(updates)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function clearCorpusBacklog(statusFilter: 'backlog' | 'published' | 'all' = 'backlog'): Promise<number> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');

  // First fetch the matching IDs so we know how many we deleted
  let query = client.from('content_corpus').select('id');
  if (statusFilter !== 'all') {
    query = statusFilter === 'backlog'
      ? query.in('status', ['backlog'])
      : query.in('status', ['backlog', 'published']);
  } else {
    // 'all' excludes in_progress items to avoid clearing active jobs
    query = query.not('status', 'eq', 'in_progress');
  }

  const { data: toDelete, error: fetchErr } = await query;
  if (fetchErr) throw new Error(fetchErr.message);
  if (!toDelete || toDelete.length === 0) return 0;

  const ids = toDelete.map((r: any) => r.id);
  const { error: deleteErr } = await client
    .from('content_corpus')
    .delete()
    .in('id', ids);
  if (deleteErr) throw new Error(deleteErr.message);
  return ids.length;
}

export async function triggerLucyBrainstorm(geminiApiKey: string, searchQuery?: string): Promise<void> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');
  if (!geminiApiKey) throw new Error('Gemini API key is required. Save it in the "Sovereign Keys" modal.');

  let prompt = '';
  if (searchQuery) {
    prompt = `You are a content strategist researching a specific entertainment event, title, or topic.
Investigate the following request thoroughly using Google Search to fetch up-to-date details for the year 2026:
Topic/Event: "${searchQuery}"

Generate a single, highly detailed critique concept card based on your search findings. Include specific instructions on why this is relevant in 2026 and what key elements to analyze (e.g. results, announcements, story directions).

You MUST respond with a raw JSON array containing exactly 1 object matching this schema. Do not add any backticks, markdown, or text outside the JSON array:
[
  {
    "title": "A clean, descriptive review title covering this topic",
    "category": "game" | "comic" | "movie",
    "notes": "Detailed strategic critique notes (1-3 sentences max) based on your live search findings"
  }
]`;
  } else {
    prompt = `You are a content strategist compiling review ideas for a high-profile retro/modern entertainment critique website.
Generate 10 trending review topics across these three categories:
- Video Games (recent releases or highly anticipated in 2026)
- Comic Books (major current reboot lines, events, or hot series in 2026)
- Cinematic Film (blockbusters, critically acclaimed releases, or anticipated movies in 2026)

Use Google Search to retrieve actual, current trends for the year 2026 so the suggestions are highly fresh, accurate, and relevant.
For each topic, write short strategic critique guidelines or notes (maximum 2 sentences) explaining why it is popular and what aspects to analyze.

You MUST respond with a raw JSON array matching this schema. Do not add any backticks, markdown, or text outside the JSON array:
[
  {
    "title": "Clean, descriptive review title (e.g. Elden Ring: Shadow of the Erdtree)",
    "category": "game" | "comic" | "movie",
    "notes": "Concise critique notes (1-2 sentences max)"
  }
]`;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const result = await response.json();

  // When Google Search grounding is active, Gemini may split content across
  // multiple parts. Join them all to avoid truncation/unterminated string errors.
  const parts: any[] = result.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p: any) => p.text ?? '').join('');
  if (!text.trim()) throw new Error('Empty response from Gemini');

  // Strip markdown code fences if the model ignored the instruction
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  // Bracket-match extract: pull the first [...] array out of the text in case
  // there's any leading/trailing prose the model accidentally added.
  function extractJsonArray(raw: string): string {
    const start = raw.indexOf('[');
    if (start === -1) return raw;
    let depth = 0;
    for (let i = start; i < raw.length; i++) {
      if (raw[i] === '[') depth++;
      else if (raw[i] === ']') { depth--; if (depth === 0) return raw.slice(start, i + 1); }
    }
    return raw.slice(start); // unterminated — return what we have for a better error
  }

  cleanText = extractJsonArray(cleanText);

  const trends = JSON.parse(cleanText);
  for (const item of trends) {
    const id = `corp-trend-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { error } = await client
      .from('content_corpus')
      .insert([
        {
          id,
          title: item.title,
          category: item.category,
          notes: item.notes,
          status: 'backlog'
        }
      ]);
    if (error) console.error('Failed to insert item:', error.message);
  }
}

export async function triggerArthurPublish(item: CorpusItem, geminiApiKey: string): Promise<string> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');
  if (!geminiApiKey) throw new Error('Gemini API key is required. Save it in the "Sovereign Keys" modal.');

  // Step 1: Update status to in_progress first to show visual feedback
  const { error: statusErr } = await client
    .from('content_corpus')
    .update({ status: 'in_progress' })
    .eq('id', item.id);
  if (statusErr) throw new Error(`Status update failed: ${statusErr.message}`);

  // Step 2: Generate draft review content via Gemini
  // Detect if the planning notes request a Doctor Doom persona override
  const doomOverride = /write (as|from|in the (voice|perspective|style) of) (doctor )?doom/i.test(item.notes || '');

  const prompt = doomOverride
    ? `You are Doctor Doom (Victor von Doom), the absolute sovereign ruler of Latveria and review editor.
Generate a comprehensive, 2-3 paragraph critique of the following subject.

Subject: "${item.title}"
Category: "${item.category}"
Planning Notes: "${item.notes || 'No extra notes'}"

Write in your signature majestic, arrogant, and extremely articulate tone. Refer to yourself in the first-person plural ("We", "Us", "Doom") or third-person.

You MUST respond with a raw JSON object matching the following schema EXACTLY. Do not add any backticks, markdown, or text outside of this JSON:
{
  "subtitle": "A short, dramatic, comic-style sub-headline",
  "excerpt": "A 1-2 sentence compelling summary hooking the reader",
  "content": "The full review text. Contain exactly 2-3 paragraphs separated by double newlines.",
  "doomRating": 4.5,
  "doomVerdict": "Lord Doom's absolute summary verdict quote (e.g., 'WE DICTATE THIS IS ACCEPTABLE ENTERTAINMENT.')",
  "faqs": [
    {
      "question": "A mock reader question about the item",
      "answer": "Doom's final, absolute response to the question"
    }
  ]
}`
    : `You are Dom Pineda, a passionate and sharp entertainment critic who writes for The Doom Chronicle.
Your voice is personal, deeply analytical, and critically witty — never shallow. You write like someone who has watched, played, and read everything, and you hold new work accountable to its creator's own history.

Your signature approach:
- Dive deep into themes, craft, and execution — not just surface plot summaries
- Compare and contrast the work being reviewed with the creator's previous projects: examine their artistic evolution, recurring stylistic choices, what has improved, and what has regressed
- Be genuinely critical when something fails, but acknowledge excellence without over-praising
- Use wit and dry humour to land observations, but never sacrifice depth for a joke
- Write in first person ("I", "my", "we" for the reader) with a confident, direct voice
- Assume your reader is intelligent and genuinely interested in the craft, not just whether something is "good or bad"

Now write a comprehensive review of the following:

Subject: "${item.title}"
Category: "${item.category}"
Planning Notes / Research Context: "${item.notes || 'No extra notes'}"

You MUST respond with a raw JSON object matching the following schema EXACTLY. Do not add any backticks, markdown, or text outside of this JSON:
{
  "subtitle": "A punchy, intriguing sub-headline that sets the tone",
  "excerpt": "A 1-2 sentence hook that makes the reader want to continue",
  "content": "The full review. Write 2-3 substantive paragraphs separated by double newlines. Include creator comparisons and go deep on craft.",
  "doomRating": 4.5,
  "doomVerdict": "Your short, decisive final verdict — a punchy quote summing up the work",
  "faqs": [
    {
      "question": "A genuine question a reader might have about the work",
      "answer": "Your direct, informed answer"
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          response_json_schema: {
            type: 'object',
            properties: {
              subtitle: { type: 'string' },
              excerpt: { type: 'string' },
              content: { type: 'string' },
              doomRating: { type: 'number' },
              doomVerdict: { type: 'string' },
              faqs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    answer: { type: 'string' }
                  },
                  required: ['question', 'answer']
                }
              }
            },
            required: ['subtitle', 'excerpt', 'content', 'doomRating', 'doomVerdict', 'faqs']
          },
          maxOutputTokens: 8192,
          temperature: 0.85,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  const draft = JSON.parse(cleanText);
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();

  const publishDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const wordCount = (draft.content || '').split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  // Step 3: Insert article into articles database table
  const articlePayload = {
    id: `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: item.title,
    category: item.category,
    subtitle: draft.subtitle || '',
    excerpt: draft.excerpt || '',
    content: draft.content || '',
    publish_date: publishDate,
    read_time: readTime,
    image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop',
    doom_rating: Number(draft.doomRating) || 4.5,
    doom_verdict: draft.doomVerdict || 'Doom approves.',
    slug,
    status: 'pending_review',
    author_name: doomOverride ? 'Dr. Doom' : 'Dom Pineda',
    geo_region: 'Latveria',
    faqs: draft.faqs || []
  };

  const { error: insertErr } = await client
    .from('articles')
    .insert([articlePayload]);

  if (insertErr) throw new Error(`Article insertion failed: ${insertErr.message}`);

  // Step 4: Complete loop and record live URL
  const publishedUrl = `https://thedoomchronicle.netlify.app/#reviews`;
  const { error: updateErr } = await client
    .from('content_corpus')
    .update({
      status: 'published',
      published_url: publishedUrl
    })
    .eq('id', item.id);

  if (updateErr) throw new Error(`Corpus logging failed: ${updateErr.message}`);

  return publishedUrl;
}

export async function rewriteArticleWithArthur(
  article: { id: string; title: string; category: string; content: string; excerpt: string; subtitle: string; doomVerdict: string; doomRating: number },
  instructions: string,
  geminiApiKey: string
): Promise<void> {
  const client = getSupabaseClient() as any;
  if (!client) throw new Error('Database client not initialized');
  if (!geminiApiKey) throw new Error('Gemini API key is required. Save it in the "Sovereign Keys" modal.');
  if (!instructions.trim()) throw new Error('Rewrite instructions cannot be empty.');

  // Detect if the rewrite instructions request a Doctor Doom persona
  const doomOverride = /write (as|from|in the (voice|perspective|style) of) (doctor )?doom/i.test(instructions);

  const prompt = doomOverride
    ? `You are Doctor Doom (Victor von Doom), the absolute sovereign ruler of Latveria and review editor.
You have already written a review and now wish to revise it based on specific editorial directives.

Original Article Title: "${article.title}"
Category: "${article.category}"

--- CURRENT REVIEW (to be rewritten) ---
Subtitle: ${article.subtitle}
Excerpt: ${article.excerpt}
Content:
${article.content}
Verdict: ${article.doomVerdict}
Rating: ${article.doomRating}/5

--- SOVEREIGN EDITORIAL DIRECTIVES (you MUST follow these exactly) ---
${instructions}

Rewrite the review from scratch incorporating the above directives. Keep your signature majestic, arrogant, and articulate Doctor Doom tone.
Refer to yourself in the first-person plural ("We", "Us", "Doom") or third-person.

You MUST respond with a raw JSON object matching the following schema EXACTLY. Do not add any backticks, markdown, or text outside of this JSON:
{
  "subtitle": "A short, dramatic, comic-style sub-headline",
  "excerpt": "A 1-2 sentence compelling summary hooking the reader",
  "content": "The full revised review text. Contain exactly 2-3 paragraphs separated by double newlines.",
  "doomRating": 4.5,
  "doomVerdict": "Lord Doom's absolute summary verdict quote",
  "faqs": [
    {
      "question": "A mock reader question about the item",
      "answer": "Doom's final, absolute response to the question"
    }
  ]
}`
    : `You are Dom Pineda, a passionate and sharp entertainment critic who writes for The Doom Chronicle.
Your voice is personal, deeply analytical, and critically witty — never shallow.

Your signature approach:
- Dive deep into themes, craft, and execution
- Compare and contrast this work with the creator's previous projects — examine artistic evolution, what has improved, what has regressed
- Be genuinely critical when something fails, acknowledge excellence without over-praising
- Use wit and dry humour to land observations, but never sacrifice depth for a joke
- Write in first person with a confident, direct voice
- Assume your reader is intelligent and interested in the craft

You have already written a draft review and now need to revise it based on specific editorial directives.

Original Article Title: "${article.title}"
Category: "${article.category}"

--- CURRENT DRAFT (to be rewritten) ---
Subtitle: ${article.subtitle}
Excerpt: ${article.excerpt}
Content:
${article.content}
Verdict: ${article.doomVerdict}
Rating: ${article.doomRating}/5

--- EDITORIAL DIRECTIVES (you MUST follow these exactly) ---
${instructions}

Rewrite the review from scratch incorporating the above directives while keeping Dom Pineda's deep, critical, witty voice.

You MUST respond with a raw JSON object matching the following schema EXACTLY. Do not add any backticks, markdown, or text outside of this JSON:
{
  "subtitle": "A punchy, intriguing sub-headline",
  "excerpt": "A 1-2 sentence hook",
  "content": "The full revised review. 2-3 substantive paragraphs separated by double newlines. Include creator comparisons and go deep on craft.",
  "doomRating": 4.5,
  "doomVerdict": "Your short, decisive final verdict",
  "faqs": [
    {
      "question": "A genuine reader question",
      "answer": "Your direct, informed answer"
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          response_json_schema: {
            type: 'object',
            properties: {
              subtitle: { type: 'string' },
              excerpt: { type: 'string' },
              content: { type: 'string' },
              doomRating: { type: 'number' },
              doomVerdict: { type: 'string' },
              faqs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    answer: { type: 'string' }
                  },
                  required: ['question', 'answer']
                }
              }
            },
            required: ['subtitle', 'excerpt', 'content', 'doomRating', 'doomVerdict', 'faqs']
          },
          maxOutputTokens: 8192,
          temperature: 0.85,
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini API returned status ${response.status}`);

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  const draft = JSON.parse(cleanText);
  const wordCount = (draft.content || '').split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const { error } = await client
    .from('articles')
    .update({
      subtitle: draft.subtitle || '',
      excerpt: draft.excerpt || '',
      content: draft.content || '',
      doom_rating: Number(draft.doomRating) || article.doomRating,
      doom_verdict: draft.doomVerdict || '',
      faqs: draft.faqs || [],
      read_time: readTime,
      status: 'pending_review',
    })
    .eq('id', article.id);

  if (error) throw new Error(`Article rewrite save failed: ${error.message}`);
}
