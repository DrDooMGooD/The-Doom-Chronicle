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
          maxOutputTokens: 3000,
          temperature: 0.7,
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
  const prompt = `You are Doctor Doom (Victor von Doom), the absolute sovereign ruler of Latveria and review editor.
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
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              subtitle: { type: 'STRING' },
              excerpt: { type: 'STRING' },
              content: { type: 'STRING' },
              doomRating: { type: 'NUMBER' },
              doomVerdict: { type: 'STRING' },
              faqs: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    question: { type: 'STRING' },
                    answer: { type: 'STRING' }
                  },
                  required: ['question', 'answer']
                }
              }
            },
            required: ['subtitle', 'excerpt', 'content', 'doomRating', 'doomVerdict', 'faqs']
          },
          maxOutputTokens: 1500,
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
    author_name: 'Dr. Doom',
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
