import { useStorage } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { appConfig } from '../config/settings';

/**
 * Returns settings with defaults already applied - no fallback logic needed by consumers
 */
export function useSettings() {
  const stored = useStorage(settingsStorage);

  return {
    anthropicApiKey: stored?.anthropicApiKey || null,
    nativeLanguage: stored?.nativeLanguage || appConfig.defaults.nativeLanguage,
    learningLanguage: stored?.learningLanguage || appConfig.defaults.learningLanguage,
    learningLevel: stored?.learningLevel || appConfig.defaults.learningLevel,
  };
}
