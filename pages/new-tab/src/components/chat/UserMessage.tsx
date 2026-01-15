import { formatRelativeTime } from '../../utils/messageHelpers';
import type { ChatMessage } from '../../types/chat';

interface UserMessageProps {
  message: ChatMessage;
}

export const UserMessage = ({ message }: UserMessageProps) => (
  <div className="flex justify-end mb-4">
    <div className="bg-primary/10 dark:bg-primary/20 text-foreground max-w-[85%] rounded-[2rem] rounded-tr-md px-8 py-4 shadow-sm border-2 border-primary/20 dark:border-primary/30 hover:border-primary/30 transition-all duration-300 group">
      {/* Text content */}
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-left font-medium">
        {message.content}
      </p>

      {/* Image preview if present */}
      {message.image && (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border-2 border-primary/20 shadow-lg group-hover:border-primary/30 transition-all">
          <img src={message.image} alt="User uploaded" className="max-h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-3 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 text-right">
        {formatRelativeTime(message.timestamp)}
      </div>
    </div>
  </div>
);
