"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "@/components/MessageBubble";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = [
  "Plan a 3-day Cairo trip",
  "Best coastal places in Egypt",
  "Hidden gems for nature lovers",
  "What should I do in Luxor?",
];

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I can help with Egypt travel ideas, ancient sites, coastal escapes, hidden gems, and trip planning. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(0, -1).map((item) => ({
            from: item.role === "user" ? "user" : "assistant",
            text: item.content,
          })),
        }),
      });

      const data = await response.json();
      const reply = data?.reply ?? "Sorry, try again.";

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: "Sorry, try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#071018]/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Live assistant</p>
          <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Egypt Panorama Chat</h2>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Ready
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} role={message.role}>
            {message.content}
          </MessageBubble>
        ))}

        {isLoading && <MessageBubble role="assistant" isTyping />}
      </div>

      <div className="border-t border-white/8 bg-[#071018]/95 p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3 shadow-inner shadow-black/20">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about Cairo, Luxor, beaches, hidden gems, or itineraries..."
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-slate-500 sm:text-[15px]"
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!canSend}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-slate-500">
          Press Enter to send. Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
}