import type { ChatMessage, ChatMessageResponse } from '../types/chat';
import { getSetting } from '../config/settings';

/**
 * Unified chat endpoint - LLM handles everything through structured output
 */
export async function sendChatMessage(
  apiKey: string,
  text: string | undefined,
  imageBase64: string | undefined,
  nativeLanguage: string,
  learningLanguage: string,
  level: string,
  history: ChatMessage[] = [],
): Promise<ChatMessageResponse> {
  if (!apiKey) {
    throw new Error('Please enter your Anthropic API key in Settings');
  }

  if (!text && !imageBase64) {
    throw new Error('Message text or image is required');
  }

  const prompt = buildPrompt(nativeLanguage, learningLanguage, level);

  // Build message content
  const messageContent: Array<{ type: string; text?: string; source?: object }> = [];

  if (imageBase64) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: match[1],
          data: match[2],
        },
      });
    }
  }

  if (text) {
    messageContent.push({ type: 'text', text });
  } else if (imageBase64) {
    messageContent.push({ type: 'text', text: 'Translate the text in this image.' });
  }

  // Build messages array with history
  const messages: Array<{ role: 'user' | 'assistant'; content: string | typeof messageContent }> = [];

  // Add recent history (last 10 messages to keep context manageable)
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Add current user message
  messages.push({ role: 'user', content: messageContent });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: getSetting('model'),
      max_tokens: 1024,
      system: prompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${(errorData as { error?: { message?: string } })?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.content?.[0]?.text || '';

  // Parse JSON response from LLM (strip markdown code fences if present)
  try {
    let jsonText = responseText.trim();
    // Remove markdown code fences if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonText);
    return {
      content: parsed.response || '',
      suggestions: (parsed.suggestions || []).map((s: { learningWord: string; nativeWord: string }) => ({
        learningWord: s.learningWord,
        nativeWord: s.nativeWord,
        learningLang: learningLanguage,
        nativeLang: nativeLanguage,
      })),
      shouldSuperimpose: parsed.shouldSuperimpose ?? false,
      type: parsed.shouldSuperimpose ? 'translation' : 'conversation',
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      content: responseText,
      suggestions: [],
      shouldSuperimpose: false,
      type: 'conversation',
    };
  }
}

/**
 * Build the system prompt - LLM returns structured JSON
 */
function buildPrompt(
  nativeLanguage: string,
  learningLanguage: string,
  level: string,
): string {
  const maxWords = getSetting('maxVocabWordsPerTranslation');

  return `You are a language tutor helping a ${nativeLanguage} speaker learn ${learningLanguage} at ${level} level.

This app builds vocabulary by superimposing ${learningLanguage} words on ${nativeLanguage} websites. When browsing, we replace nativeWord with learningWord (case-insensitive match).

CRITICAL: Only ONE word per sentence maximum. When a ${learningLanguage} word appears surrounded by familiar ${nativeLanguage} context, the brain automatically maps meaning. Multiple replacements per sentence destroys this.

Respond with JSON:
{
  "response": "Your response text",
  "suggestions": [{"learningWord": "...", "nativeWord": "..."}],
  "shouldSuperimpose": true/false
}

Three scenarios:

A) TRANSLATION: User gives ${learningLanguage} text to translate
   - response: Translate to ${nativeLanguage}
   - suggestions: ${maxWords} words max, ONE per sentence
   - shouldSuperimpose: true

B) NEW VOCABULARY: User asks "How do I say X?" or wants to add a word
   - response: Teach the word briefly
   - suggestions: [{nativeWord: "${nativeLanguage} word", learningWord: "${learningLanguage} word"}]
   - shouldSuperimpose: false (your response is conversational, not a translation)

C) EXPLANATION/OTHER: Grammar, conjugation, general questions
   - response: Explain in ${nativeLanguage}
   - suggestions: [] (empty)
   - shouldSuperimpose: false

IMPORTANT:
- nativeWord is ALWAYS in ${nativeLanguage} (the language found on websites)
- learningWord is ALWAYS in ${learningLanguage}
- shouldSuperimpose=true ONLY for scenario A (pure translations)

Suggestion rules:
- nativeWord must appear EXACTLY in your response (case-insensitive match)
- Pick single common words, not phrases (e.g. "cold" not "very cold")
- Choose words that make sense when replaced in random ${nativeLanguage} text
- Prefer nouns, adjectives, common verbs

Only output valid JSON.`;
}
