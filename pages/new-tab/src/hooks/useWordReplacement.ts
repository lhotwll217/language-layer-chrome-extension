import {
  createVocabMap,
  buildWordPattern,
  getTextNodesContainingWords,
  replaceWordsInTextNode,
  restoreOriginalText,
} from '../utils/wordReplacement';
import { useEffect } from 'react';
import type { VocabularySuggestion } from '../types/chat';
import type { VocabWord } from '../utils/wordReplacement';

interface VocabularyItem {
  nativeWord: string;
  learningWord: string;
  nativeLang: string;
  learningLang: string;
  enabled?: boolean;
}

/**
 * Hook that applies word replacement to a DOM element
 * Replaces vocabulary words with styled chips and adds hover tooltips
 *
 * @param contentRef - Ref to the DOM element to apply replacements to
 * @param vocabulary - Array of vocabulary items from storage
 * @param suggestions - Array of vocabulary suggestions from AI
 */
export function useWordReplacement(
  contentRef: React.RefObject<HTMLElement>,
  vocabulary: VocabularyItem[],
  suggestions?: VocabularySuggestion[],
) {
  useEffect(() => {
    if (!contentRef.current) return;

    // Combine active vocabulary + current message suggestions
    const wordsToReplace: VocabWord[] = [];

    // Add enabled vocabulary items
    vocabulary.forEach(item => {
      if (item.enabled !== false) {
        wordsToReplace.push(item);
      }
    });

    // Add suggestions not already in vocabulary (case-insensitive check)
    if (suggestions && suggestions.length > 0) {
      const existingWords = new Set(wordsToReplace.map(w => w.nativeWord.toLowerCase()));

      suggestions.forEach(suggestion => {
        if (!existingWords.has(suggestion.nativeWord.toLowerCase())) {
          wordsToReplace.push(suggestion);
        }
      });
    }

    // If no words to replace, cleanup and exit
    if (wordsToReplace.length === 0) {
      return;
    }

    // Build vocabulary lookup map
    const vocabMap = createVocabMap(wordsToReplace);

    // Build regex pattern
    const pattern = buildWordPattern(wordsToReplace);

    // Get all text nodes that contain vocabulary words
    const textNodes = getTextNodesContainingWords(contentRef.current, pattern);

    // Replace words in each text node
    textNodes.forEach(textNode => {
      replaceWordsInTextNode(textNode, pattern, vocabMap);
    });

    // Cleanup: restore original text on unmount
    return () => {
      if (contentRef.current) {
        restoreOriginalText(contentRef.current);
      }
    };
  }, [contentRef, vocabulary, suggestions]);
}
