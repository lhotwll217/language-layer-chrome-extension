/**
 * Generates a unique message ID based on timestamp and random suffix
 */
export function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats a timestamp to a human-readable relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60000) {
    return 'just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Show date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

/**
 * Extracts vocabulary words that need highlighting in a message
 * Combines active vocabulary with current message suggestions
 */
export function getVocabularyWordsForMessage(
  vocabulary: Array<{ nativeWord: string; learningWord: string; nativeLang: string; learningLang: string; enabled?: boolean }>,
  suggestions?: Array<{ nativeWord: string; learningWord: string; nativeLang: string; learningLang: string }>,
) {
  const words = vocabulary.filter(w => w.enabled !== false);

  if (suggestions) {
    // Add suggestions that aren't already in vocabulary (case-insensitive)
    const existingWords = new Set(words.map(w => w.nativeWord.toLowerCase()));
    const newSuggestions = suggestions.filter(s => !existingWords.has(s.nativeWord.toLowerCase()));
    words.push(...newSuggestions);
  }

  return words;
}
