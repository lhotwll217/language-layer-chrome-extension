import '@src/NewTab.css';
import { useEffect, useState } from 'react';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import {
  cn,
  ErrorDisplay,
  LoadingSpinner,
  ToggleButton,
  Tabs,
  TabsContent,
  TooltipProvider,
} from '@extension/ui';

import { ChatInterface } from './components/chat/ChatInterface';
import { VocabularyList } from './components/VocabularyList';
import { Settings } from './components/Settings';
import { SlidingTabs } from './components/SlidingTabs';
import { useVocabularyStorage } from './hooks/useVocabularyStorage';
import { useSettings } from './hooks/useSettings';
import { Settings as SettingsIcon } from 'lucide-react';

const NewTab = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const vocabulary = useVocabularyStorage();
  const settings = useSettings();
  const [activeTab, setActiveTab] = useState('chat');

  // Apply dark class to document for proper CSS variable scoping
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !isLight);
  }, [isLight]);

  const tabs = [
    { value: 'chat', label: 'Chat' },
    { 
      value: 'vocabulary', 
      label: 'Vocabulary',
      badge: (isActive: boolean) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-black transition-colors duration-300",
          isActive 
            ? "bg-card-foreground/20 text-card-foreground" 
            : "bg-muted-foreground/20 text-muted-foreground"
        )}>
          {vocabulary.count}
        </span>
      )
    },
    { 
      value: 'settings', 
      label: 'Settings',
      icon: <SettingsIcon className="h-3.5 w-3.5" />
    },
  ];

  return (
    <TooltipProvider>
      <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <header className="flex-shrink-0 flex items-center justify-between px-10 py-6 z-30 bg-background border-b border-border">
            <div className="flex items-center gap-12">
              <div className="flex flex-col group cursor-default">
                <h1 className="text-2xl font-black tracking-tighter leading-none group-hover:text-primary transition-colors">
                  Stitchr
                </h1>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 ml-0.5 mt-1.5">
                  Language Layer
                </p>
              </div>

              <nav>
                <SlidingTabs 
                  tabs={tabs}
                  value={activeTab}
                  onValueChange={setActiveTab}
                />
              </nav>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Learning Mode</span>
                <span className="text-xs font-bold text-primary">{settings.learningLanguage}</span>
              </div>
              <ToggleButton className="h-10 px-6 font-bold text-[10px] uppercase tracking-widest">
                {isLight ? 'Dark Mode' : 'Light Mode'}
              </ToggleButton>
            </div>
          </header>

          <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <TabsContent value="chat" className="flex-1 m-0 p-0 min-h-0 h-full flex flex-col overflow-hidden outline-none data-[state=inactive]:hidden">
              <ChatInterface />
            </TabsContent>

            <TabsContent value="vocabulary" className="flex-1 m-0 p-0 min-h-0 h-full overflow-auto bg-background outline-none data-[state=inactive]:hidden">
              <div className="max-w-5xl mx-auto py-16 px-10">
                <div className="mb-12">
                  <h2 className="text-5xl font-black tracking-tighter mb-4">My Vocabulary</h2>
                  <div className="h-1.5 w-20 bg-primary rounded-full mb-6" />
                  <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                    Words and phrases you've collected during your conversations. Master these to build your fluency.
                  </p>
                </div>
                <VocabularyList
                  vocabulary={vocabulary.vocabulary}
                  onToggle={vocabulary.toggleWord}
                  onDelete={vocabulary.removeWord}
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 p-0 min-h-0 h-full overflow-auto bg-background outline-none data-[state=inactive]:hidden">
              <div className="max-w-4xl mx-auto py-16 px-10">
                <div className="mb-12">
                  <h2 className="text-5xl font-black tracking-tighter mb-4">Settings</h2>
                  <div className="h-1.5 w-20 bg-primary rounded-full mb-6" />
                  <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                    Customize your learning journey and configure your AI connection.
                  </p>
                </div>
                <div className="bg-background rounded-3xl border-2 border-border/40 p-8 shadow-sm">
                  <Settings />
                </div>
              </div>
            </TabsContent>
          </main>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <LoadingSpinner />), ErrorDisplay);
