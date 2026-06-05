"use client";

import React, { useEffect, useRef, useState } from "react";

type Message = { id: string; from: "user" | "bot"; text: string };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<"en-US" | "ar-EG">("en-US");
  const [speechError, setSpeechError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const getBrowserSpeechLanguage = () => {
    if (typeof navigator === "undefined") {
      return "en-US" as const;
    }

    return navigator.language?.toLowerCase().startsWith("ar") ? "ar-EG" : "en-US";
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    setSpeechLanguage(getBrowserSpeechLanguage());

    return () => {
      recognitionRef.current = null;
    };
  }, []);

  const buildRecognition = () => {
    if (typeof window === "undefined") return null;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = speechLanguage;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setSpeechError("");
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join("")
        .trim();

      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setSpeechError("Microphone access is blocked. Allow microphone permission in the browser and try again.");
      } else if (event.error === "no-speech") {
        setSpeechError("No speech detected. Try again and speak a little louder.");
      } else {
        setSpeechError("Voice input is unavailable right now. Please try again.");
      }
      setIsRecording(false);
    };

    return recognition;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: String(Date.now()), from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Chat API error:", res.status, data);
      }

      const replyText = data?.reply ?? data?.error ?? "Sorry, I couldn't generate a reply.";
      const botMsg: Message = { id: String(Date.now() + 1), from: "bot", text: replyText };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      console.error("Chat request failed:", err);
      const botMsg: Message = { id: String(Date.now() + 2), from: "bot", text: "Sorry, the assistant is unavailable." };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      const recognition = buildRecognition();
      if (!recognition) {
        return;
      }

      recognitionRef.current = recognition;
      setSpeechSupported(true);
    }

    if (!recognitionRef.current) {
      recognitionRef.current = buildRecognition();
    }

    if (!recognitionRef.current) {
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    recognitionRef.current.lang = speechLanguage;
    try {
      setSpeechError("");
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setSpeechError("Voice input could not start. Check browser microphone permissions.");
      setIsRecording(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .chatbot-button { position: fixed; right: 20px; bottom: 22px; z-index: 9999; }
        .chatbot-fab { background: radial-gradient(circle at top, #1e170f 0%, #0d0a06 72%, #050403 100%); border-radius: 9999px; width: 56px; height: 56px; display:flex; align-items:center; justify-content:center; box-shadow: 0 10px 28px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(232,160,0,0.18); cursor:pointer; }
        .chat-window { position: fixed; right: 20px; bottom: 90px; width: 360px; max-width: calc(100% - 40px); height: 520px; background: #0D0A06; color: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 9999; display:flex; flex-direction:column; font-family: 'Cinzel', serif; }
        .chat-header { padding: 12px 14px; display:flex; align-items:center; justify-content:space-between; border-bottom: 1px solid rgba(232,160,0,0.08); }
        .chat-title { color:#E8A000; font-weight:700; font-size:16px; }
        .chat-body { padding: 12px; overflow:auto; flex:1; }
        .chat-row { display:flex; margin-bottom:10px; }
        .chat-row.user { justify-content:flex-end; }
        .bubble { max-width:80%; padding:10px 12px; border-radius:12px; font-size:14px; line-height:1.3; }
        .bubble.user { background: linear-gradient(90deg,#2b2b2b,#111); color:#fff; border-radius:12px 12px 6px 12px; }
        .bubble.bot { background: #151313; color:#fff; border: 1px solid rgba(232,160,0,0.06); border-radius:12px 12px 12px 6px; }
        .chat-input { padding:10px; border-top:1px solid rgba(255,255,255,0.03); display:flex; flex-direction:column; gap:8px; }
        .input-row { display:flex; gap:8px; align-items:center; }
        .action-row { display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; }
        .input-field { flex:1; min-width:0; background:transparent; border:1px solid rgba(255,255,255,0.04); padding:10px; color:#fff; border-radius:8px; }
        .send-btn { background:#E8A000; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; }
        .mic-btn { width:40px; height:40px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:#14110f; color:#F5D37B; cursor:pointer; transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease; }
        .mic-btn:hover { transform: translateY(-1px); border-color: rgba(232,160,0,0.28); background:#1a1511; }
        .mic-btn.recording { color:#ff5a5a; border-color: rgba(255,90,90,0.45); background: rgba(120, 20, 20, 0.22); }
        .lang-btn { min-width: 42px; height: 40px; padding: 0 10px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:#14110f; color:#cfc0a0; cursor:pointer; font-size:12px; font-weight:700; letter-spacing:0.04em; transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease; }
        .lang-btn:hover { transform: translateY(-1px); border-color: rgba(232,160,0,0.28); background:#1a1511; }
        .lang-btn.active { color:#0d0a06; background: linear-gradient(135deg, #f5d37b, #e8a000); border-color: rgba(232,160,0,0.55); }
        .mic-pulse { position: relative; }
        .mic-pulse::before { content: ""; position:absolute; inset:-6px; border-radius:9999px; border:1px solid rgba(255,90,90,0.45); animation: pulse 1.15s ease-out infinite; }
        @keyframes pulse { 0% { transform: scale(0.85); opacity: 0.7; } 70% { transform: scale(1.25); opacity: 0; } 100% { opacity: 0; } }
        .speech-error { margin-top: 8px; color: #f99; font-size: 12px; line-height: 1.4; }
        .close-btn { background:transparent; border: none; color: #fff; cursor:pointer; }
        .typing { display:inline-block; width:36px; text-align:center; }
        .dot { display:inline-block; width:6px; height:6px; margin:0 2px; background:#E8A000; border-radius:50%; animation: blink 1s infinite; }
        .dot:nth-child(2) { animation-delay: 0.15s }
        .dot:nth-child(3) { animation-delay: 0.3s }
        @keyframes blink { 0% { opacity: 0.2 } 50% { opacity: 1 } 100% { opacity: 0.2 } }
        @media (max-width: 420px) {
          .action-row { justify-content: space-between; }
          .send-btn { flex: 1 1 auto; }
          .lang-btn { margin-left: auto; }
        }
      `}</style>

      <div className="chatbot-button">
        <div className="chatbot-fab" role="button" aria-label="Open chat" onClick={() => setOpen(true)} title="Chat with Egypt Panorama Assistant">
          <img src="/images/pyramids_svg.svg" alt="Egypt Panorama" width="28" height="28" className="h-7 w-7 object-contain" />
        </div>
      </div>

      {open && (
        <div className="chat-window" role="dialog" aria-label="Egypt Panorama Assistant">
          <div className="chat-header">
            <div className="chat-title">Egypt Panorama Assistant</div>
            <div>
              <button className="close-btn" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
            </div>
          </div>

          <div className="chat-body" ref={scrollRef} data-testid="chat-body">
            {messages.length === 0 && (
              <div style={{ color: '#ccc', fontSize: 13, marginBottom: 12 }}>Hi — ask me about Egypt tourism, destinations, or travel tips.</div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`chat-row ${m.from === 'user' ? 'user' : 'bot'}`}>
                <div className={`bubble ${m.from === 'user' ? 'user' : 'bot'}`} data-testid={`msg-${m.from}`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-row bot">
                <div className="bubble bot"><span className="typing"><span className="dot"/> <span className="dot"/> <span className="dot"/></span></div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <div className="input-row">
              <input aria-label="Message" className="input-field" placeholder="Ask about Cairo, Luxor, or hidden gems..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} />
              <button className="send-btn" onClick={sendMessage} data-testid="send-btn">Send</button>
            </div>
            <div className="action-row">
              <button
                type="button"
                className={`mic-btn ${isRecording ? "recording mic-pulse" : ""}`}
                onClick={toggleSpeechRecognition}
                aria-label={isRecording ? "Stop recording" : "Start voice input"}
                title={speechSupported ? (isRecording ? "Stop recording" : "Voice input") : "Speech recognition not supported"}
                disabled={!speechSupported}
              >
                {isRecording ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className={`lang-btn ${speechLanguage === "ar-EG" ? "active" : ""}`}
                onClick={() => {
                  setSpeechLanguage((current) => (current === "en-US" ? "ar-EG" : "en-US"));
                  setSpeechError("");
                }}
                aria-label={`Switch speech language to ${speechLanguage === "en-US" ? "Arabic" : "English"}`}
                title={`Speech language: ${speechLanguage === "en-US" ? "English" : "Arabic"}`}
              >
                {speechLanguage === "en-US" ? "EN" : "AR"}
              </button>
            </div>
          </div>
          {speechError && <div className="px-3 pb-3 speech-error">{speechError}</div>}
        </div>
      )}
    </>
  );
}
