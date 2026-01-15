import { Button, Collapsible, CollapsibleTrigger, CollapsibleContent } from '@extension/ui';
import { ChevronDown, Check, X } from 'lucide-react';
import React from 'react';
import type { VocabularySuggestion } from '../../types/chat';

interface VocabularySectionCollapsibleProps {
  suggestions: VocabularySuggestion[];
  isExpanded: boolean;
  onToggleExpanded: (expanded: boolean) => void;
  onApprove: (suggestion: VocabularySuggestion) => void;
  onReject: (nativeWord: string) => void;
  isInVocabulary: (nativeWord: string) => boolean;
  approved?: Set<string>;
  rejected?: Set<string>;
}

export function VocabularySectionCollapsible({
  suggestions,
  isExpanded,
  onToggleExpanded,
  onApprove,
  onReject,
  isInVocabulary,
  approved = new Set(),
  rejected = new Set(),
}: VocabularySectionCollapsibleProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpanded} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground h-auto py-2 w-full justify-start text-[10px] font-black uppercase tracking-[0.2em]">
          <ChevronDown className={`mr-3 h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          Vocabulary Suggestions ({suggestions.length})
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-300">
        <div className="rounded-2xl border border-border/40 bg-muted/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_1fr_90px] gap-4 px-6 py-1.5 bg-muted/20 border-b border-border/40">
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Original</span>
            <span className="w-4" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40 text-left">Translation</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40 text-right pr-4">Actions</span>
          </div>

          {/* Line Items */}
          <div className="divide-y divide-border/20">
            {suggestions
              .filter(s => s && s.nativeWord) // Filter out invalid suggestions
              .map((suggestion, index) => {
              const nativeWord = suggestion.nativeWord || '';
              const isApproved = approved.has(nativeWord);
              const isRejected = rejected.has(nativeWord);
              const isAlreadyInVocab = isInVocabulary(nativeWord);
              const isDisabled = isApproved || isRejected;

              if (isRejected) return null;

              return (
                <div
                  key={`${nativeWord}-${index}`}
                  className={`grid grid-cols-[1fr_auto_1fr_90px] gap-4 px-6 py-1 items-center transition-colors hover:bg-muted/30 ${
                    isDisabled ? 'opacity-40 grayscale pointer-events-none' : ''
                  }`}
                >
                  <span className="text-xs font-bold tracking-tight truncate">{nativeWord}</span>
                  <span className="text-muted-foreground/30 font-bold text-[10px]">→</span>
                  <span className="text-xs font-black tracking-tight text-primary truncate text-left">{suggestion.learningWord}</span>
                  
                  <div className="flex items-center gap-1 justify-end pr-1">
                    {isAlreadyInVocab || isApproved ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border-2 border-primary/20">
                        <Check className="h-3 w-3 stroke-[3px]" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Added</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-green-600 hover:text-green-700 hover:bg-green-100/50 active:scale-90 transition-all border border-transparent hover:border-green-200"
                          onClick={() => onApprove(suggestion)}
                        >
                          <Check className="h-4 w-4 stroke-[2.5px]" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 hover:bg-red-100/50 active:scale-90 transition-all border border-transparent hover:border-red-200"
                          onClick={() => onReject(nativeWord)}
                        >
                          <X className="h-4 w-4 stroke-[2.5px]" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
