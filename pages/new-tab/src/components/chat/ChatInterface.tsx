import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { sendChatMessage } from '../../api/chat';
import { fileToBase64 } from '../../api/translate';
import { useVocabularyStorage } from '../../hooks/useVocabularyStorage';
import { useSettings } from '../../hooks/useSettings';
import { generateMessageId } from '../../utils/messageHelpers';
import React, { useEffect, useState } from 'react';
import type { ChatMessage, VocabularySuggestion } from '../../types/chat';

const CHAT_STORAGE_KEY = 'chat-history-v1';
const MAX_MESSAGES = 50;

export function ChatInterface() {
  const settings = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { vocabulary, addWord, hasWord } = useVocabularyStorage();

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const result = await chrome.storage.local.get(CHAT_STORAGE_KEY);
        if (result[CHAT_STORAGE_KEY]) {
          setMessages(result[CHAT_STORAGE_KEY]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();
  }, []);

  // Persist chat history whenever it changes
  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        // Keep only the most recent MAX_MESSAGES messages
        const recentMessages = messages.slice(-MAX_MESSAGES);
        await chrome.storage.local.set({
          [CHAT_STORAGE_KEY]: recentMessages,
        });
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    };

    saveChatHistory();
  }, [messages]);

  const handleSendMessage = async (text: string, image?: File) => {
    if (!settings.anthropicApiKey) {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        type: 'conversation',
        content: 'API key is not configured. Please add your Anthropic API key in Settings.',
        timestamp: Date.now(),
        error: 'API key missing',
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (!text.trim() && !image) {
      return;
    }

    try {
      setIsLoading(true);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        type: 'conversation', // Will be determined by content
        content: text,
        image: image ? await fileToBase64(image) : undefined,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMessage]);

      let imageBase64: string | undefined;
      if (image) {
        imageBase64 = await fileToBase64(image);
      }

      // Call unified API - LLM handles everything (pass message history for context)
      const response = await sendChatMessage(
        settings.anthropicApiKey,
        text.trim() || undefined,
        imageBase64,
        settings.nativeLanguage,
        settings.learningLanguage,
        settings.learningLevel,
        messages,
      );

      // Update user message type based on response
      userMessage.type = response.type;

      // Add AI response message
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        type: response.type,
        content: response.content,
        extractedText: response.extractedText,
        suggestions: response.suggestions,
        shouldSuperimpose: response.shouldSuperimpose,
        timestamp: Date.now(),
        vocabularyExpanded: false, // Start collapsed
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        type: 'conversation',
        content: 'An error occurred. Please try again.',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVocab = async (suggestion: VocabularySuggestion) => {
    try {
      await addWord({
        nativeWord: suggestion.nativeWord,
        learningWord: suggestion.learningWord,
        nativeLang: suggestion.nativeLang,
        learningLang: suggestion.learningLang,
        source: 'ai',
      });
    } catch (error) {
      console.error('Failed to add vocabulary word:', error);
    }
  };

  const handleRejectVocab = (nativeWord: string) => {
    // Remove from suggestions in all messages
    setMessages(prev =>
      prev.map(msg => {
        if (msg.suggestions) {
          return {
            ...msg,
            suggestions: msg.suggestions.filter(s => s?.nativeWord?.toLowerCase() !== nativeWord.toLowerCase()),
          };
        }
        return msg;
      }),
    );
  };

  const handleToggleVocabularyExpanded = (messageId: string, expanded: boolean) => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, vocabularyExpanded: expanded } : msg)));
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      try {
        await chrome.storage.local.remove(CHAT_STORAGE_KEY);
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear chat history:', error);
      }
    }
  };

  const handleQuickAction = (action: string) => {
    // Could be used to pre-fill the input with a hint
    let hint = '';
    switch (action) {
      case 'translate':
        hint = 'Translate: ';
        break;
      case 'image':
        hint = 'Paste an image with text to translate. ';
        break;
      case 'learn':
        hint = 'How do I... ';
        break;
    }
    // In a full implementation, we could focus the input and pre-fill
    console.log('Quick action clicked:', action);
  };

  return (
    <div className="bg-background flex h-full flex-col min-h-0 overflow-hidden w-full relative">
      {/* Messages area - optimized for scrolling */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        <ChatMessageList
          messages={messages}
          vocabulary={vocabulary}
          isLoadingLast={isLoading}
          onApproveVocab={handleApproveVocab}
          onRejectVocab={handleRejectVocab}
          onToggleVocabularyExpanded={handleToggleVocabularyExpanded}
          onQuickActionClick={handleQuickAction}
        />
      </div>

      {/* Input area - floating and integrated */}
      <div className="flex-shrink-0 w-full px-10 pb-10 pt-4 z-20">
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} apiKeyMissing={!settings.anthropicApiKey} />
        </div>
      </div>
      
      {/* Absolute "Clear" button */}
      <div className="absolute top-0 right-10 z-30 opacity-20 hover:opacity-100 transition-all duration-300 transform -translate-y-1/2 hover:translate-y-2">
        <button
          onClick={handleClearHistory}
          className="text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground hover:text-destructive px-4 py-2 rounded-full border border-border bg-background/80 backdrop-blur-md shadow-sm"
          title="Clear chat history">
          Clear History
        </button>
      </div>
    </div>
  );
}
