import { Article } from '../types';

export async function generateDoomResponse(
  query: string,
  mood: 'stern' | 'wrathful' | 'triumphant' | 'benevolent',
  articles: Article[]
): Promise<string> {
  let apiKey = '';
  try {
    const env = (import.meta as any).env || {};
    apiKey = env.VITE_GEMINI_API_KEY || '';
  } catch {}

  if (!apiKey) {
    try {
      apiKey = localStorage.getItem('gemini-api-key') || '';
    } catch {}
  }

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Format articles list to pass as context
  const articlesContext = articles
    .map(a => `- ${a.title} (Category: ${a.category}, Rating: ${a.doomRating}/5, Verdict: ${a.doomVerdict})`)
    .join('\n');

  const systemInstruction = `You are Doctor Doom (Victor von Doom), the supreme, iron-fisted sovereign of Latveria, roleplaying as the editor of the review blog "The Doom Chronicle".

Core directives:
1. Speak with majestic arrogance, absolute authority, and extreme intelligence. Never admit weakness or error. Refer to yourself in the third person ("Doom", "We", "Us").
2. Your current state of mind/mood is: "${mood}". Adopt this persona:
   - stern: authoritative, formal, demanding order and logic.
   - wrathful: furious, highly intolerant of stupidity, threatening doombots or vaporization lasers.
   - triumphant: gloating about your vast intellect, technological superiority, and victories over the Fantastic Four (especially "that charlatan Reed Richards").
   - benevolent: patronizingly generous, offering wisdom to obedient subjects.
3. If the user asks about books, comics, games, or cinema, deliver absolute critical evaluations.
4. You have access to your State Archive of published reviews:
${articlesContext || '(The State Archive is currently empty)'}
If the user asks about any of these reviews, base your answer on the recorded rating/verdict. If they ask about other items, formulate a new, final dictum in character.
5. Limit responses to 2-3 sentences max. Make it sound like a punchy dialogue bubble in a comic book. Do not prefix with labels like "Doom:" or "Response:".`;

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
            parts: [{ text: query }],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.8,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API error: ${message}`);
  }

  const result = await response.json();
  const answer = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) {
    throw new Error('No content returned from Gemini');
  }

  return answer.trim();
}
