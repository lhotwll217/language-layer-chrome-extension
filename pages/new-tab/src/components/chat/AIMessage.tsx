import { VocabularySectionCollapsible } from './VocabularySectionCollapsible';
import { useWordReplacement } from '../../hooks/useWordReplacement';
import { formatRelativeTime } from '../../utils/messageHelpers';
import { Skeleton } from '@extension/ui';
import { useRef, useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import type { ChatMessage, VocabularySuggestion } from '../../types/chat';

interface VocabularyItem {
  nativeWord: string;
  learningWord: string;
  nativeLang: string;
  learningLang: string;
  enabled?: boolean;
}

interface AIMessageProps {
  message: ChatMessage;
  vocabulary: VocabularyItem[];
  isLoading?: boolean;
  onApproveVocab?: (suggestion: VocabularySuggestion) => void;
  onRejectVocab?: (nativeWord: string) => void;
  onToggleVocabularyExpanded?: (messageId: string, expanded: boolean) => void;
}

export function AIMessage({
  message,
  vocabulary,
  isLoading = false,
  onApproveVocab,
  onRejectVocab,
  onToggleVocabularyExpanded,
}: AIMessageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [approvedInMessage, setApprovedInMessage] = useState<Set<string>>(new Set());
  const [rejectedInMessage, setRejectedInMessage] = useState<Set<string>>(new Set());

  // Filter out invalid vocabulary items (where nativeWord is missing)
  const validVocabulary = vocabulary.filter(v => v && v.nativeWord);

  // Apply word replacement only if shouldSuperimpose is true (pure translations)
  // For conversations, skip superimposition
  useWordReplacement(
    contentRef,
    message.shouldSuperimpose !== false ? validVocabulary : [],
    message.shouldSuperimpose !== false ? message.suggestions : []
  );

  const isInVocabulary = useCallback((nativeWord: string) =>
    validVocabulary.some(v => v?.nativeWord?.toLowerCase() === nativeWord?.toLowerCase()),
    [validVocabulary]
  );

  const handleApprove = useCallback((suggestion: VocabularySuggestion) => {
    setApprovedInMessage(prev => new Set(prev).add(suggestion.nativeWord));
    onApproveVocab?.(suggestion);
  }, [onApproveVocab]);

  const handleReject = useCallback((nativeWord: string) => {
    setRejectedInMessage(prev => new Set(prev).add(nativeWord));
    onRejectVocab?.(nativeWord);
  }, [onRejectVocab]);

  const handleToggleVocab = (expanded: boolean) => {
    onToggleVocabularyExpanded?.(message.id, expanded);
  };

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-4xl space-y-6 py-4 px-2 transition-all">
        {/* Error state */}
        {message.error && (
          <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive shadow-sm animate-in fade-in slide-in-from-left-2">
            <span className="font-bold uppercase tracking-widest text-[10px] mr-2">Error</span>
            {message.error}
          </div>
        )}

        {/* Main content */}
        {isLoading ? (
          <div className="space-y-3 text-left">
            <Skeleton className="h-4 w-[90%] rounded-full" />
            <Skeleton className="h-4 w-[75%] rounded-full" />
            <Skeleton className="h-4 w-[80%] rounded-full" />
          </div>
        ) : (
          <div className="space-y-6 text-left">
            {/* Extracted text from image (if present) */}
            {message.extractedText && (
              <div className="bg-muted/50 border-2 border-border rounded-2xl p-6 shadow-sm text-left">
                <div className="text-primary mb-3 font-black uppercase tracking-[0.2em] text-[10px]">Source Text</div>
                <div className="font-mono text-sm leading-relaxed text-foreground selection:bg-primary/30">{message.extractedText}</div>
              </div>
            )}

            {/* Main translation/response with word superimposition */}
            <div ref={contentRef} className="prose prose-sm dark:prose-invert max-w-none break-words leading-[1.8] text-[15px] text-foreground text-left [&_*]:text-left selection:bg-primary/20">
              <Markdown>{message.content}</Markdown>
            </div>

            {/* Timestamp */}
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">{formatRelativeTime(message.timestamp)}</div>
          </div>
        )}

        {/* Vocabulary suggestions section */}
        {message.suggestions && message.suggestions.length > 0 && !isLoading && (
          <div className="mt-8 rounded-3xl border-2 border-border bg-card/50 p-2 shadow-sm transition-all hover:border-primary/20 hover:bg-card hover:shadow-xl duration-500">
            <VocabularySectionCollapsible
              suggestions={message.suggestions}
              isExpanded={message.vocabularyExpanded || false}
              onToggleExpanded={handleToggleVocab}
              onApprove={handleApprove}
              onReject={handleReject}
              isInVocabulary={isInVocabulary}
              approved={approvedInMessage}
              rejected={rejectedInMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
