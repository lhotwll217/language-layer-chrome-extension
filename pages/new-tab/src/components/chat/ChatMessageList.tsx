import { ChatMessage } from './ChatMessage';
import { ChatWelcomeMessage } from './ChatWelcomeMessage';
import { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType, VocabularySuggestion } from '../../types/chat';

interface VocabularyItem {
  nativeWord: string;
  learningWord: string;
  nativeLang: string;
  learningLang: string;
  enabled?: boolean;
}

interface ChatMessageListProps {
  messages: ChatMessageType[];
  vocabulary: VocabularyItem[];
  isLoadingLast?: boolean;
  onApproveVocab?: (suggestion: VocabularySuggestion) => void;
  onRejectVocab?: (nativeWord: string) => void;
  onToggleVocabularyExpanded?: (messageId: string, expanded: boolean) => void;
  onQuickActionClick?: (action: string) => void;
}

export function ChatMessageList({
  messages,
  vocabulary,
  isLoadingLast = false,
  onApproveVocab,
  onRejectVocab,
  onToggleVocabularyExpanded,
  onQuickActionClick,
}: ChatMessageListProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom only when NEW messages are added or loading state changes
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesLength.current;
    
    if (scrollContainerRef.current && (isNewMessage || isLoadingLast)) {
      setTimeout(() => {
        if (scrollViewportRef.current) {
          scrollViewportRef.current.scrollTo({
            top: scrollViewportRef.current.scrollHeight,
            behavior: isNewMessage ? 'smooth' : 'auto',
          });
        }
      }, 0);
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages.length, isLoadingLast]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-center">
        <ChatWelcomeMessage onQuickActionClick={onQuickActionClick} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto scrollbar-none transition-colors" ref={scrollViewportRef}>
      <div ref={scrollContainerRef} className="max-w-4xl mx-auto px-10 py-12 space-y-12">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
            vocabulary={vocabulary}
            isLoading={isLoadingLast && index === messages.length - 1}
            onApproveVocab={onApproveVocab}
            onRejectVocab={onRejectVocab}
            onToggleVocabularyExpanded={onToggleVocabularyExpanded}
          />
        ))}

        {/* Loading indicator for last message */}
        {isLoadingLast && (
          <div className="flex justify-start animate-in fade-in duration-700 slide-in-from-left-4">
            <div className="flex items-center space-x-6 py-8 px-4">
              <div className="flex space-x-1.5">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse [animation-duration:1.5s]" />
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-pulse [animation-duration:1.5s] [animation-delay:0.3s]" />
                <div className="h-1.5 w-1.5 bg-primary/30 rounded-full animate-pulse [animation-duration:1.5s] [animation-delay:0.6s]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">
                Stitchr Thinking
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
