import dotenv from 'dotenv';
dotenv.config();

import { getSupabaseClient } from '../../../../src/lib/supabaseClient';

async function generateArticleData(title: string, category: string, notes: string, apiKey: string) {
  const prompt = `You are Doctor Doom (Victor von Doom), the absolute sovereign ruler of Latveria and review editor.
Generate a comprehensive, 2-3 paragraph critique of the following subject.

Subject: "${title}"
Category: "${category}"
Planning Notes: "${notes || 'No extra notes'}"

Write in your signature majestic, arrogant, and extremely articulate tone. Refer to yourself in the first-person plural ("We", "Us", "Doom") or third-person.

You MUST respond with a raw JSON object matching the following schema EXACTLY. Do not add any backticks, markdown, or text outside of this JSON:
{
  "subtitle": "A short, dramatic, comic-style sub-headline",
  "excerpt": "A 1-2 sentence compelling summary hooking the reader",
  "content": "The full review text. Contain exactly 2-3 paragraphs separated by double newlines.",
  "doomRating": 4.5,
  "doomVerdict": "Lord Doom's absolute summary verdict quote (e.g., 'WE DICTATE THIS IS ACCEPTABLE ENTERTAINMENT.')",
  "seoTitle": "An SEO-optimised title tag (50-60 chars). Target a specific search query someone would type to find this review. Different from the main title — more keyword-intentional.",
  "seoDescription": "A compelling meta description (140-155 chars). Written as ad copy to earn the click from Google search results. Hint at the verdict and intrigue the reader.",
  "imageQuery": "2-5 keywords for an Unsplash image search that visually represents this subject (e.g. 'dark souls gameplay', 'marvel comics spiderman', 'sci-fi film dramatic')",
  "faqs": [
    {
      "question": "A mock reader question about the item",
      "answer": "Doom's final, absolute response to the question"
    }
  ]
}`;

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
        generationConfig: {
          response_json_schema: {
            type: 'object',
            properties: {
              subtitle: { type: 'string' },
              excerpt: { type: 'string' },
              content: { type: 'string' },
              doomRating: { type: 'number' },
              doomVerdict: { type: 'string' },
              seoTitle: { type: 'string' },
              seoDescription: { type: 'string' },
              imageQuery: { type: 'string' },
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
            required: ['subtitle', 'excerpt', 'content', 'doomRating', 'doomVerdict', 'seoTitle', 'seoDescription', 'imageQuery', 'faqs']
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
    console.error('❌ Parse Error. Gemini API Response object:', JSON.stringify(result, null, 2));
    throw new Error(`JSON parse error: ${parseErr.message}`);
  }
}

function buildImageUrl(imageQuery: string, category: string): string {
  const fallbacks: Record<string, string> = {
    game: 'video,game,controller,neon',
    comic: 'comics,superhero,art,colorful',
    movie: 'cinema,film,dramatic,screen',
  };
  const raw = imageQuery?.trim() || fallbacks[category] || 'entertainment,dark,dramatic';
  const keywords = raw.replace(/\s+/g, ',').replace(/,+/g, ',');
  return `https://loremflickr.com/800/450/${encodeURIComponent(keywords)}`;
}

async function main() {
  console.log('🤖 ARTHUR: THE ARTICLE AUTOMATOR RUNNING...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');


  const client = getSupabaseClient() as any;
  if (!client) {
    console.error('❌ Supabase client initialization failed.');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.error('❌ GEMINI_API_KEY environment variable is missing.');
    process.exit(1);
  }

  // Step 1: Query content_corpus for items in progress
  console.log('📡 Step 1: Querying content backlog table for items in progress...');
  const { data: backlogItems, error: fetchErr } = await client
    .from('content_corpus')
    .select('*')
    .eq('status', 'in_progress');

  if (fetchErr) {
    console.error('❌ Database error querying backlog:', fetchErr.message);
    process.exit(1);
  }

  if (!backlogItems || backlogItems.length === 0) {
    console.log('✅ ARTHUR: No backlog items are currently marked as "in_progress". Nothing to do.');
    process.exit(0);
  }

  console.log(`🤖 Found ${backlogItems.length} item(s) to publish!`);

  for (const item of backlogItems) {
    console.log(`\n✍️ Drafting review for: "${item.title}" (${item.category.toUpperCase()})...`);
    
    try {
      // Step 2: Generate draft content via Gemini
      const draft = await generateArticleData(item.title, item.category, item.notes, apiKey);
      
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();

      const publishDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const wordCount = (draft.content || '').split(/\s+/).length;
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

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
        seo_title: draft.seoTitle || item.title,
        seo_description: draft.seoDescription || draft.excerpt || '',
        image_url: buildImageUrl(draft.imageQuery, item.category),
        slug,
        status: 'pending_review',
        author_name: 'Dr. Doom',
        geo_region: 'Latveria',
        faqs: draft.faqs || []
      };

      // Step 3: Insert article
      console.log(`📡 Pushing generated article to published ledger...`);
      const { error: insertErr } = await client
        .from('articles')
        .insert([articlePayload]);

      if (insertErr) {
        throw new Error(`Failed to insert article: ${insertErr.message}`);
      }

      // Step 4: Update corpus planning item
      const publishedUrl = `https://thedoomchronicle.netlify.app/#reviews`;
      console.log(`📡 Updating planning status in content corpus table...`);
      const { error: updateErr } = await client
        .from('content_corpus')
        .update({
          status: 'published',
          published_url: publishedUrl
        })
        .eq('id', item.id);

      if (updateErr) {
        throw new Error(`Failed to update content corpus row: ${updateErr.message}`);
      }

      console.log(`🎉 SUCCESS: "${item.title}" is now LIVE!`);
      console.log(`🔗 Live URL: ${publishedUrl}`);

    } catch (itemErr: any) {
      console.error(`❌ Error processing item "${item.title}":`, itemErr.message);
    }
  }

  console.log('\n🏆 ARTHUR: Auto-publishing sequence complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Unexpected runner failure:', err);
  process.exit(1);
});
