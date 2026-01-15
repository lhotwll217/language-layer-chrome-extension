export interface VocabularyItem {
  nativeWord: string;    // Word in user's native language (found on websites)
  learningWord: string;  // Word in language being learned (replacement)
  nativeLang: string;    // e.g., "English"
  learningLang: string;  // e.g., "Finnish"
  enabled?: boolean;
  addedAt?: number;
  source?: 'hardcoded' | 'ai' | 'manual';
}
