export type MessageRole = 'user' | 'assistant';

export type MessageType = 'translation' | 'conversation';

export interface VocabularySuggestion {
  nativeWord: string;    // Word in user's native language (for website replacement)
  learningWord: string;  // Word in language being learned
  nativeLang: string;    // e.g., "English"
  learningLang: string;  // e.g., "Finnish"
}

export interface ChatMessage {
  id: string; // Unique identifier
  role: MessageRole;
  type: MessageType; // Distinguish translation vs conversation
  content: string; // Main text content
  image?: string; // Base64 image data (for user messages)
  timestamp: number; // Unix timestamp

  // Translation-specific fields
  extractedText?: string; // OCR text from image
  suggestions?: VocabularySuggestion[]; // Vocabulary suggestions
  vocabularyExpanded?: boolean; // Track collapsed/expanded state
  shouldSuperimpose?: boolean; // Whether to overlay vocabulary words in content

  // Metadata
  error?: string; // Error message if API failed
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatMessageResponse {
  content: string; // Main response text
  extractedText?: string; // For image translations
  suggestions: VocabularySuggestion[]; // Vocabulary suggestions
  type: MessageType; // Echo back the type
  shouldSuperimpose?: boolean; // Whether to overlay words (true for pure translations, false for mixed)
}
