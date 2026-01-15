import { useState, useMemo } from 'react';
import { ScrollArea } from '@extension/ui';
import { BookOpen, Search } from 'lucide-react';
import { VocabularyListItem } from './VocabularyListItem';
import type { VocabularyItem } from '@extension/storage';

interface VocabularyListProps {
  vocabulary: VocabularyItem[];
  onToggle: (nativeWord: string) => void;
  onDelete: (nativeWord: string) => void;
}

export const VocabularyList = ({ vocabulary, onToggle, onDelete }: VocabularyListProps) => {
  const [search, setSearch] = useState('');

  const filteredVocabulary = useMemo(() => {
    if (!search.trim()) return vocabulary;

    const query = search.toLowerCase();
    return vocabulary.filter(item => item.nativeWord.toLowerCase().includes(query) || item.learningWord.toLowerCase().includes(query));
  }, [vocabulary, search]);

  const enabledCount = vocabulary.filter(v => v.enabled !== false).length;

  return (
    <div className="flex flex-col h-full bg-card rounded-[1.5rem] border border-border overflow-hidden shadow-sm transition-all hover:shadow-md duration-500">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-[200px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-[11px] font-bold tracking-tight rounded-lg border border-border bg-background focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border shadow-sm">
          <BookOpen className="h-3 w-3 text-primary" />
          <span className="text-[8px] font-black uppercase tracking-widest text-foreground">
            {enabledCount} <span className="opacity-40 mx-0.5">/</span> {vocabulary.length}
          </span>
        </div>
      </div>

      <div className="flex-1 p-2 overflow-hidden flex flex-col min-h-0">
        {vocabulary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-black tracking-tight mb-1">Library Empty</h3>
          </div>
        ) : filteredVocabulary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-black tracking-tight">No Matches</h3>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_auto_1fr_90px] gap-4 px-6 py-2 border-b border-border mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Original</span>
              <span className="w-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Translation</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right pr-4">Actions</span>
            </div>

            <ScrollArea className="flex-1 px-1">
              <div className="space-y-0 pb-2">
                {filteredVocabulary.map(item => (
                  <VocabularyListItem
                    key={item.nativeWord}
                    item={item}
                    onToggle={() => onToggle(item.nativeWord)}
                    onDelete={() => onDelete(item.nativeWord)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};
