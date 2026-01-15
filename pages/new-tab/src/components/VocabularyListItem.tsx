import { Button, Switch } from '@extension/ui';
import { Trash2 } from 'lucide-react';
import type { VocabularyItem } from '@extension/storage';

interface VocabularyListItemProps {
  item: VocabularyItem;
  onToggle: () => void;
  onDelete: () => void;
}

export const VocabularyListItem = ({ item, onToggle, onDelete }: VocabularyListItemProps) => {
  const isEnabled = item.enabled !== false;

  return (
    <div className={`grid grid-cols-[1fr_auto_1fr_90px] gap-4 px-6 py-0.5 items-center rounded-lg border border-transparent hover:border-border/40 hover:bg-muted/20 transition-all duration-200 group ${
      !isEnabled ? 'opacity-40' : ''
    }`}>
      <span className={`text-sm font-bold tracking-tight truncate ${!isEnabled ? 'line-through' : ''}`}>
        {item.nativeWord}
      </span>

      <span className="text-muted-foreground/20 font-bold text-[10px]">→</span>

      <span className={`text-sm font-black tracking-tight text-primary truncate ${!isEnabled ? 'text-muted-foreground line-through' : 'text-primary'}`}>
        {item.learningWord}
      </span>

      <div className="flex items-center justify-end gap-3 pr-1">
        <Switch 
          checked={isEnabled} 
          onCheckedChange={onToggle}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition-all"
          onClick={onDelete}
          title="Delete word">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
