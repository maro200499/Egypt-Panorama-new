"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import ActivityReviews from "@/components/activity/ActivityReviews";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Activity {
  id: number | string;
  name: string;
  type?: string;
  category?: string;
  destination_id?: number | string;
  destination_name?: string;
  rating?: number | null;
  price?: string | number | null;
  image_url?: string | null;
  description?: string | null;
  audio_url?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  tourism_type?: string | null;
  is_hidden?: boolean;
}

export interface Destination {
  id: number | string;
  name: string;
  city?: string;
  type?: string;
}

// ── Helper Functions ──────────────────────────────────────────────────────
function fmt(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function starsFromRating(r: number | null | undefined): string {
  const rating = r ?? 0;
  const full = Math.floor(rating);
  return "★".repeat(full) + (rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(rating));
}

// ── Karaoke Text Component ─────────────────────────────────────────────────
interface KaraokeTextProps {
  text: string;
  progress: number;
  duration: number;
}

function KaraokeText({ text, progress, duration }: KaraokeTextProps) {
  const words = text ? text.split(" ") : [];
  const ratio = duration > 0 ? progress / duration : 0;
  const activeIdx = Math.floor(ratio * words.length);

  return (
    <div style={{
      padding: 28,
      lineHeight: 2.2,
      fontSize: 16,
      color: "#fff",
    }}>
      {words.map((word, i) => {
        const isDone = i < activeIdx;
        const isActive = i === activeIdx;
        
        return (
          <span
            key={i}
            style={{
              display: "inline",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              color: isDone
                ? "#d4af37"
                : isActive
                  ? "#e8d96f"
                  : "rgba(255,255,255,0.6)",
              fontWeight: isActive || isDone ? 700 : 400,
              textShadow: isActive
                ? "0 0 12px rgba(212,175,55,0.6), 0 0 24px rgba(212,175,55,0.4)"
                : "none",
              transform: isActive ? "scale(1.08)" : "scale(1)",
              paddingLeft: i === 0 ? 0 : 4,
            }}
          >
            {word}{" "}
          </span>
        );
      })}
    </div>
  );
}

// ── Waveform Component ─────────────────────────────────────────────────────
interface WaveformProps {
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
}

function Waveform({ progress, duration, onSeek }: WaveformProps) {
  const BARS = 60;
  const [heights] = useState(() =>
    Array.from({ length: BARS }, () => Math.random() * 0.75 + 0.25)
  );
  const activeBar = duration > 0 ? Math.floor((progress / duration) * BARS) : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div onClick={handleClick} style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 60, cursor: "pointer", marginBottom: 20, userSelect: "none" }}>
      {heights.map((h, i) => {
        const isPast = i < activeBar;
        const isActive = i === activeBar;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              borderRadius: 3,
              background: isPast
                ? "linear-gradient(180deg, #d4af37, #a0823d)"
                : isActive
                  ? "#e8d96f"
                  : "#e8e8e8",
              transition: "all 0.15s ease",
              transform: isActive ? "scaleY(1.2)" : "scaleY(1)",
              boxShadow: isPast ? "0 0 8px rgba(212,175,55,0.3)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Audio Player Component ─────────────────────────────────────────────────
interface AudioPlayerProps {
  src: string;
  title: string;
  onProgress?: (current: number, duration: number) => void;
}

function AudioPlayer({ src, title, onProgress }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [hoveringButton, setHoveringButton] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta = () => setDuration(audio.duration);
    const onTime = () => {
      setCurrent(audio.currentTime);
      onProgress?.(audio.currentTime, audio.duration);
    };
    const onEnd = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [onProgress]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const seek = (t: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = t;
      setCurrent(t);
    }
  };

  const skip = (s: number) => {
    const audio = audioRef.current;
    if (audio) seek(Math.max(0, Math.min(duration, audio.currentTime + s)));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0d1117 100%)",
      borderRadius: 20,
      padding: 32,
      border: "1px solid rgba(212,175,55,0.15)",
      boxShadow: "0 16px 48px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,175,55,0.1)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        top: -80,
        right: -80,
        width: 300,
        height: 300,
        background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        bottom: -60,
        left: -60,
        width: 250,
        height: 250,
        background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        animation: "float 10s ease-in-out infinite reverse",
      }} />

      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header */}
      <div style={{ marginBottom: 28, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4af37, #c9a84c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
          }}>
            🎧
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#c9a84c", letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 700 }}>
              Premium Audio Guide
            </p>
            <p style={{ margin: 0, fontSize: 22, color: "#fff", fontWeight: 800, letterSpacing: 0.2 }}>
              {title}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Waveform */}
      <div style={{ marginBottom: 24, position: "relative", zIndex: 1 }}>
        <Waveform progress={current} duration={duration} onSeek={seek} />
      </div>

      {/* Time Display */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Current</p>
          <span style={{ fontSize: 14, color: "#d4af37", fontFamily: "monospace", fontWeight: 700, letterSpacing: 1 }}>{fmt(current)}</span>
        </div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Duration</p>
          <span style={{ fontSize: 14, color: "#555", fontFamily: "monospace", letterSpacing: 1 }}>{fmt(duration)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 28, position: "relative", zIndex: 1 }}>
        <div style={{
          height: 6,
          background: "linear-gradient(90deg, #333 0%, #444 100%)",
          borderRadius: 3,
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          seek(ratio * duration);
        }}
        >
          <div style={{
            height: "100%",
            width: `${duration > 0 ? (current / duration) * 100 : 0}%`,
            background: "linear-gradient(90deg, #d4af37, #e8d96f)",
            transition: "width 0.1s linear",
            boxShadow: "0 0 12px rgba(212,175,55,0.5)",
          }} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 28, position: "relative", zIndex: 1 }}>
        {/* Rewind Button */}
        <button
          onClick={() => skip(-15)}
          onMouseEnter={() => setHoveringButton("rewind")}
          onMouseLeave={() => setHoveringButton(null)}
          style={{
            background: hoveringButton === "rewind" ? "rgba(212,175,55,0.2)" : "transparent",
            border: "2px solid " + (hoveringButton === "rewind" ? "#d4af37" : "#555"),
            color: hoveringButton === "rewind" ? "#d4af37" : "#c9a84c",
            cursor: "pointer",
            fontSize: 20,
            padding: 12,
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            transform: hoveringButton === "rewind" ? "scale(1.1)" : "scale(1)",
          }}
        >
          ⏮
        </button>

        {/* Play Button */}
        <button
          onClick={toggle}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: playing
              ? "linear-gradient(135deg, #e8d96f, #d4af37)"
              : "linear-gradient(135deg, #d4af37, #c9a84c)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#0d0d1a",
            fontWeight: "bold",
            boxShadow: playing
              ? "0 8px 32px rgba(212,175,55,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 8px 32px rgba(212,175,55,0.35)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: playing ? "scale(1.05)" : "scale(1)",
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.transform = "scale(1.12)";
            btn.style.boxShadow = "0 12px 48px rgba(212,175,55,0.6), inset 0 1px 0 rgba(255,255,255,0.3)";
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.transform = playing ? "scale(1.05)" : "scale(1)";
            btn.style.boxShadow = playing
              ? "0 8px 32px rgba(212,175,55,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 8px 32px rgba(212,175,55,0.35)";
          }}
        >
          {playing ? "⏸" : "▶"}
        </button>

        {/* Forward Button */}
        <button
          onClick={() => skip(15)}
          onMouseEnter={() => setHoveringButton("forward")}
          onMouseLeave={() => setHoveringButton(null)}
          style={{
            background: hoveringButton === "forward" ? "rgba(212,175,55,0.2)" : "transparent",
            border: "2px solid " + (hoveringButton === "forward" ? "#d4af37" : "#555"),
            color: hoveringButton === "forward" ? "#d4af37" : "#c9a84c",
            cursor: "pointer",
            fontSize: 20,
            padding: 12,
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            transform: hoveringButton === "forward" ? "scale(1.1)" : "scale(1)",
          }}
        >
          ⏭
        </button>
      </div>

      {/* Volume Control */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 18, color: "#c9a84c", minWidth: 24 }}>🔊</span>
        <div style={{ flex: 1 }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${volume * 100}%, #333 ${volume * 100}%, #333 100%)`,
              outline: "none",
              cursor: "pointer",
              WebkitAppearance: "none",
              width: "100%",
            } as React.CSSProperties}
          />
        </div>
        <span style={{ fontSize: 12, color: "#999", fontWeight: 700, minWidth: 28 }}>{Math.round(volume * 100)}%</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(-20px);
          }
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(212,175,55,0.6);
          transition: all 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          width: 18px;
          height: 18px;
          box-shadow: 0 0 16px rgba(212,175,55,0.8);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 12px rgba(212,175,55,0.6);
          transition: all 0.2s;
        }
        input[type="range"]::-moz-range-thumb:hover {
          width: 18px;
          height: 18px;
          box-shadow: 0 0 16px rgba(212,175,55,0.8);
        }
      `}</style>
    </div>
  );
}

// ── Quick Facts with Colored Icons ─────────────────────────────────────────
interface FactItem {
  icon: string;
  label: string;
  value: string | null;
  color: string;
}

function QuickFactRow({ icon, label, value, color }: FactItem) {
  if (!value) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, paddingTop: 16, borderBottom: "1px solid rgba(212,175,55,0.1)",
      transition: "all 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={e => {
      const div = e.currentTarget as HTMLDivElement;
      div.style.paddingLeft = "8px";
      div.style.background = "rgba(212,175,55,0.05)";
      div.style.borderRadius = "8px";
    }}
    onMouseLeave={e => {
      const div = e.currentTarget as HTMLDivElement;
      div.style.paddingLeft = "0";
      div.style.background = "transparent";
      div.style.borderRadius = "0";
    }}
    >
      <div style={{ fontSize: 24, minWidth: 32, textAlign: "center" }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 14, color: "#fff", fontWeight: 700, letterSpacing: 0.2 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ActivityDetailPage({
  activity,
  destination,
}: {
  activity: Activity | null;
  destination?: Destination | null;
}) {
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);

  const handleProgress = useCallback((cur: number, dur: number) => {
    setAudioProgress(cur);
    setAudioDuration(dur);
  }, []);

  useEffect(() => {
    setBgLoaded(false);
    if (!activity?.image_url) return;

    const img = new Image();
    img.src = activity.image_url;
    img.onload = () => setBgLoaded(true);
  }, [activity?.image_url]);

  if (!activity) return null;

  const rating = activity.rating ?? 0;
  const stars = starsFromRating(rating);
  const mapUrl = activity.latitude && activity.longitude 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(activity.longitude) - 0.01},${Number(activity.latitude) - 0.01},${Number(activity.longitude) + 0.01},${Number(activity.latitude) + 0.01}&layer=mapnik&marker=${activity.latitude},${activity.longitude}`
    : null;

  const facts: FactItem[] = [
    { icon: "🏛", label: "Destination", value: destination?.name || activity.destination_name || null, color: "#2196f3" },
    { icon: "🎯", label: "Type", value: activity.type || null, color: "#ff9800" },
    { icon: "📌", label: "Category", value: activity.category || null, color: "#9c27b0" },
    { icon: "🗺", label: "Tourism Type", value: activity.tourism_type || null, color: "#4caf50" },
    { icon: "💰", label: "Price", value: activity.price ? `${activity.price} EGP` : "Free", color: "#c9a84c" },
    { icon: "⭐", label: "Rating", value: rating ? `${stars} (${rating}/5)` : null, color: "#ffc107" },
    { icon: "📍", label: "Coordinates", value: activity.latitude ? `${Number(activity.latitude).toFixed(4)}, ${Number(activity.longitude).toFixed(4)}` : null, color: "#f44336" },
  ];

  return (
    <div style={{ background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0d1117 100%)", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <div style={{ position: "relative", height: 450, overflow: "hidden" }}>
        {/* Background Image */}
        {activity.image_url && (
          <img
            src={activity.image_url}
            alt={activity.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: bgLoaded ? 1 : 0,
              transition: "opacity 0.6s ease",
              filter: "brightness(0.45) saturate(0.85) contrast(1.1)",
            }}
          />
        )}

        {/* Dark Overlay Gradient with Gold Accent */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,20,25,0.95) 0%, rgba(26,31,46,0.8) 35%, rgba(26,31,46,0.4) 65%, transparent 100%)",
          }}
        />

        {/* Gold Accent Gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.15) 0%, transparent 60%)",
          }}
        />

        {/* Content */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 40px 48px",
        }}>
          <Link href="/activities" style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
            color: "#d4af37", textDecoration: "none", fontSize: 12,
            background: "rgba(212,175,55,0.08)", backdropFilter: "blur(12px)",
            padding: "10px 18px", borderRadius: 8, border: "1px solid rgba(212,175,55,0.25)",
            fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", transition: "all 0.3s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(212,175,55,0.15)";
            e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(212,175,55,0.08)";
            e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)";
          }}
          >
            ← Back
          </Link>

          <h1 style={{ 
            margin: 0, fontSize: 56, color: "#fff", fontWeight: 900, lineHeight: 1.05, 
            marginBottom: 20, textShadow: "0 4px 24px rgba(0,0,0,0.5)",
            letterSpacing: -0.5,
          }}>
            {activity.name}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))", backdropFilter: "blur(12px)", padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(212,175,55,0.25)" }}>
              <span style={{ fontSize: 22, color: "#d4af37", letterSpacing: 3 }}>{stars}</span>
              <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{rating}/5</span>
            </div>

            {activity.price && (
              <div style={{
                background: "linear-gradient(135deg, #d4af37, #c9a84c)",
                color: "#0d0d1a", padding: "10px 20px", borderRadius: 10,
                fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2,
                boxShadow: "0 6px 24px rgba(212,175,55,0.4)",
              }}>
                {activity.price} EGP
              </div>
            )}

            {activity.category && (
              <div style={{ color: "#d4af37", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, background: "rgba(212,175,55,0.1)", padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(212,175,55,0.2)" }}>
                {activity.category}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40, alignItems: "start" }}>
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {/* ABOUT SECTION */}
            {activity.description && (
              <div style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                borderRadius: 20, padding: 32,
                border: "1px solid rgba(212,175,55,0.15)", borderLeft: "6px solid #d4af37",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,175,55,0.1)",
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 24 }}>📖</span>
                  <h2 style={{ margin: 0, fontSize: 20, color: "#fff", fontWeight: 800, letterSpacing: 0.2 }}>
                    About This Activity
                  </h2>
                </div>
                <p style={{
                  margin: 0, fontSize: 15, lineHeight: 1.95, whiteSpace: "pre-wrap",
                  color: "rgba(255,255,255,0.85)", letterSpacing: 0.3,
                }}>
                  {activity.description}
                </p>
              </div>
            )}

            {/* AUDIO GUIDE SECTION */}
            {activity.audio_url && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 28 }}>🎧</span>
                  <h2 style={{ margin: 0, fontSize: 20, color: "#fff", fontWeight: 800, letterSpacing: 0.2 }}>
                    Audio Guide
                  </h2>
                </div>
                <AudioPlayer src={activity.audio_url} title={activity.name} onProgress={handleProgress} />

                {/* Karaoke Text */}
                {activity.description && (
                  <div style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                    borderRadius: 20, marginTop: 32,
                    border: "1px solid rgba(212,175,55,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    backdropFilter: "blur(10px)",
                  }}>
                    <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(212,175,55,0.1)", background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)" }}>
                      <h3 style={{ margin: 0, fontSize: 13, color: "#d4af37", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
                        ✨ Follow Along with Audio
                      </h3>
                    </div>
                    <KaraokeText text={activity.description} progress={audioProgress} duration={audioDuration} />
                  </div>
                )}
              </div>
            )}

            {/* LOCATION SECTION */}
            {mapUrl && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 28 }}>📍</span>
                  <h2 style={{ margin: 0, fontSize: 20, color: "#fff", fontWeight: 800, letterSpacing: 0.2 }}>
                    Location
                  </h2>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.02)", borderRadius: 20, padding: 0,
                  border: "1px solid rgba(212,175,55,0.15)", overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}>
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height={340}
                    style={{ border: "none", display: "block" }}
                    allowFullScreen={true}
                    loading="lazy"
                  />
                </div>
                <div style={{ marginTop: 24 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
                    Coordinates
                  </p>
                  <code style={{
                    display: "block", fontSize: 13, color: "#d4af37", fontFamily: "monospace",
                    background: "rgba(212,175,55,0.08)", padding: 16, borderRadius: 10, border: "1px solid rgba(212,175,55,0.15)",
                    fontWeight: 700, letterSpacing: 0.6, lineHeight: 1.8,
                  }}>
                    {Number(activity.latitude).toFixed(6)}, {Number(activity.longitude).toFixed(6)}
                  </code>
                  <a
                    href={`https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block", marginTop: 16,
                      color: "#d4af37", textDecoration: "none", fontSize: 12,
                      fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", transition: "all 0.3s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#e8d96f";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "#d4af37";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    → Open in Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside>
            <div style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
              borderRadius: 20, padding: 32,
              border: "1px solid rgba(212,175,55,0.15)", position: "sticky", top: 32,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <span style={{ fontSize: 24 }}>⭐</span>
                <h2 style={{ margin: 0, fontSize: 18, color: "#fff", fontWeight: 800, letterSpacing: 0.2 }}>
                  Quick Facts
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {facts.map((fact, i) => (
                  <div key={i}>
                    <QuickFactRow {...fact} />
                  </div>
                ))}
              </div>

              {destination && (
                <Link href={`/destinations/${activity.destination_id}`} style={{
                  display: "block", marginTop: 28, padding: 15, textAlign: "center",
                  background: "linear-gradient(135deg, #d4af37, #c9a84c)",
                  color: "#0d0d1a", textDecoration: "none", borderRadius: 12,
                  fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: 1.2, transition: "all 0.3s", boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,175,55,0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,175,55,0.3)";
                }}
                >
                  🔍 Explore Destination →
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>

      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 24px 56px" }}>
        <ActivityReviews activityId={activity.id} activityName={activity.name} />
      </div>

      {/* Animations and Responsive Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
          h1 {
            font-size: 36px !important;
          }
        }
      `}</style>
    </div>
  );
}
