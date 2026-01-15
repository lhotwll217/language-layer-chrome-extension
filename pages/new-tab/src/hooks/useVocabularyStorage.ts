import { useStorage } from '@extension/shared';
import { vocabularyStorage, type VocabularyItem } from '@extension/storage';
import { useMemo, useCallback } from 'react';

export const useVocabularyStorage = () => {
  const rawVocabulary = useStorage(vocabularyStorage);

  // Ensure vocabulary is always an array and filter out legacy items
  const vocabulary = useMemo(() => {
    if (!rawVocabulary || !Array.isArray(rawVocabulary)) {
      return [];
    }
    // Filter out legacy items with old field names
    return rawVocabulary.filter(item => item.nativeWord && item.learningWord);
  }, [rawVocabulary]);

  // Get active (enabled) vocabulary
  const activeVocabulary = useMemo(() => {
    return vocabulary.filter(item => item.enabled !== false);
  }, [vocabulary]);

  // Add a new word
  const addWord = useCallback(async (item: Omit<VocabularyItem, 'addedAt'>) => {
    await vocabularyStorage.addWord(item);
  }, []);

  // Remove a word
  const removeWord = useCallback(async (nativeWord: string) => {
    await vocabularyStorage.removeWord(nativeWord);
  }, []);

  // Toggle word enabled state
  const toggleWord = useCallback(async (nativeWord: string) => {
    await vocabularyStorage.toggleWord(nativeWord);
  }, []);

  // Check if a word exists in vocabulary
  const hasWord = useCallback(
    (nativeWord: string) => {
      return vocabulary.some(item => item.nativeWord.toLowerCase() === nativeWord.toLowerCase());
    },
    [vocabulary]
  );

  return {
    vocabulary,
    activeVocabulary,
    addWord,
    removeWord,
    toggleWord,
    hasWord,
    count: vocabulary.length,
    activeCount: activeVocabulary.length,
  };
};
