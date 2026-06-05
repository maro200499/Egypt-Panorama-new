type MessageBubbleProps = {
  role: 'user' | 'assistant';
  children: React.ReactNode;
  isTyping?: boolean;
};

export default function MessageBubble({ role, children, isTyping = false }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-[fadeIn_220ms_ease-out]`}>
      <div
        className={`max-w-[92%] rounded-3xl border px-4 py-3 text-sm leading-6 shadow-lg sm:max-w-[80%] sm:px-5 sm:py-4 sm:text-[15px] ${
          isUser
            ? 'border-cyan-400/20 bg-cyan-500/12 text-slate-50 shadow-cyan-950/20'
            : 'border-white/10 bg-white/6 text-slate-100 shadow-black/20'
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-2 py-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}