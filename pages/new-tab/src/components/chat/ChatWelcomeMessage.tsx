import { Card, Button } from '@extension/ui';
import { MessageSquare, Image, HelpCircle } from 'lucide-react';
import React from 'react';

interface ChatWelcomeMessageProps {
  onQuickActionClick?: (action: string) => void;
}

export function ChatWelcomeMessage({ onQuickActionClick }: ChatWelcomeMessageProps) {
  const quickActions = [
    {
      id: 'translate',
      label: 'Text',
      description: 'Contextual translations',
      icon: MessageSquare,
    },
    {
      id: 'image',
      label: 'Image',
      description: 'Visual translation',
      icon: Image,
    },
    {
      id: 'learn',
      label: 'Explain',
      description: 'Grammar & usage help',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center max-w-3xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-3 mb-8 md:mb-12">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter">
            Embed Vocab Learning Into Your Everyday Browsing
          </h2>
          <div className="h-1 w-16 md:w-20 bg-primary rounded-full mx-auto" />
        </div>
        <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Stitchr builds your vocabulary and weaves it into the websites you already visit. Words you're learning appear in context, so your brain connects the dots naturally.
        </p>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 md:gap-4">
        {quickActions.map(action => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onQuickActionClick?.(action.id)}
              className="group relative flex flex-col items-start p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-border/40 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                <IconComponent className="h-16 md:h-20 w-16 md:w-20" />
              </div>

              <div className="mb-3 md:mb-4 p-2 md:p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="text-sm md:text-base font-black tracking-tight group-hover:text-primary transition-colors">
                  {action.label}
                </h3>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground leading-snug">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
