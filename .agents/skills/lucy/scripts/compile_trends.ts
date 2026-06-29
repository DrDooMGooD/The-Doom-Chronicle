import dotenv from 'dotenv';
dotenv.config();

import { getSupabaseClient } from '../../../../src/lib/supabaseClient';

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = args[i + 1];
      if (val && !val.startsWith('--')) {
        result[key] = val;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}

async function fetchTrendingTopics(apiKey: string, query?: string) {
  let prompt = '';
  if (query) {
    prompt = `You are a content strategist researching a specific entertainment event, title, or topic.
Investigate the following request thoroughly using Google Search to fetch up-to-date details for the year 2026:
Topic/Event: "${query}"

Generate a single, highly detailed critique concept card based on your search findings. Include specific instructions on why this is relevant in 2026 and what key elements to analyze.

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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
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
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleanText);
  } catch (parseErr: any) {
    console.error('Raw text returned by Gemini that failed to parse:', text);
    throw new Error(`JSON parse error: ${parseErr.message}`);
  }
}

async function main() {
  console.log('📡 LUCY: COMPILING TRENDING BACKLOG ITEMS...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const args = parseArgs(process.argv.slice(2));
  const query = args.query || '';

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.error('❌ Error: GEMINI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  const client = getSupabaseClient() as any;
  if (!client) {
    console.error('❌ Error: Supabase client failed to initialize.');
    process.exit(1);
  }

  try {
    if (query) {
      console.log(`📝 Querying Gemini to investigate topic: "${query}"...`);
    } else {
      console.log('📝 Querying Gemini for top 10 trends...');
    }
    
    const trends = await fetchTrendingTopics(apiKey, query || undefined);
    
    console.log(`✅ Received ${trends.length} trending items. Inserting into corpus database...`);
    
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

      if (error) {
        console.error(`❌ Failed to insert "${item.title}":`, error.message);
      } else {
        console.log(`   + Added: [${item.category.toUpperCase()}] "${item.title}"`);
      }
    }

    console.log(`\n🏆 LUCY: Backlog successfully updated!`);
    process.exit(0);

  } catch (err: any) {
    console.error('❌ Lucy compilation failed:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Runner error:', err);
  process.exit(1);
});
