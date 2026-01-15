import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { cn } from '@extension/ui';

interface Tab {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode | ((isActive: boolean) => React.ReactNode);
}

interface SlidingTabsProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SlidingTabs({ tabs, value, onValueChange, className }: SlidingTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when value changes
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeButton = container.querySelector(`[data-value="${value}"]`) as HTMLButtonElement;
    if (!activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    setIndicatorStyle({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    });
  }, [value]);

  // Also update on resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;

      const activeButton = container.querySelector(`[data-value="${value}"]`) as HTMLButtonElement;
      if (!activeButton) return;

      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex items-center bg-muted p-1.5 rounded-2xl border border-border',
        className
      )}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1.5 bottom-1.5 bg-card rounded-xl shadow-md border-2 border-border transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {/* Tab buttons */}
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        const badge = typeof tab.badge === 'function' ? tab.badge(isActive) : tab.badge;
        
        return (
          <button
            key={tab.value}
            data-value={tab.value}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              'relative z-10 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-colors duration-300',
              isActive
                ? 'text-card-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
            {badge}
          </button>
        );
      })}
    </div>
  );
}

