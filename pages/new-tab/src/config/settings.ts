/**
 * App config - centralized defaults
 */
export const appConfig = {
  // AI config
  model: 'claude-haiku-4-5',
  maxVocabWordsPerTranslation: 4,

  // User setting defaults (used when settingsStorage is empty)
  defaults: {
    nativeLanguage: 'English',
    learningLanguage: 'Finnish',
    learningLevel: 'B1' as const,
  },
} as const;

export function getSetting<K extends keyof typeof appConfig>(key: K): typeof appConfig[K] {
  return appConfig[key];
}
