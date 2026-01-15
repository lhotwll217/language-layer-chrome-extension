import { AIMessage } from './AIMessage';
import { UserMessage } from './UserMessage';
import React from 'react';
import type { ChatMessage as ChatMessageType, VocabularySuggestion } from '../../types/chat';

interface VocabularyItem {
  nativeWord: string;
  learningWord: string;
  nativeLang: string;
  learningLang: string;
  enabled?: boolean;
}

interface ChatMessageProps {
  message: ChatMessageType;
  vocabulary: VocabularyItem[];
  isLoading?: boolean;
  onApproveVocab?: (suggestion: VocabularySuggestion) => void;
  onRejectVocab?: (nativeWord: string) => void;
  onToggleVocabularyExpanded?: (messageId: string, expanded: boolean) => void;
}

export function ChatMessage({
  message,
  vocabulary,
  isLoading = false,
  onApproveVocab,
  onRejectVocab,
  onToggleVocabularyExpanded,
}: ChatMessageProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 mb-4 duration-300">
      {message.role === 'user' ? (
        <UserMessage message={message} />
      ) : (
        <AIMessage
          message={message}
          vocabulary={vocabulary}
          isLoading={isLoading}
          onApproveVocab={onApproveVocab}
          onRejectVocab={onRejectVocab}
          onToggleVocabularyExpanded={onToggleVocabularyExpanded}
        />
      )}
    </div>
  );
}
