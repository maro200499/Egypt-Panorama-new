"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function starsFromRating(r: number | null | undefined) {
  const rating = r ?? 0;
  const full = Math.floor(rating);
  return "★".repeat(full) + (rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(rating));
}

// ── KaraokeText ───────────────────────────────────────────────────────────────
function KaraokeText({ text, progress, duration }: { text: string; progress: number; duration: number }) {
  const words = text ? text.split(" ") : [];
  const ratio = duration > 0 ? progress / duration : 0;
  const activeIdx = Math.floor(ratio * words.length);

  return (
    <p style={{
      fontSize: 15.5,
      lineHeight: 2,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      letterSpacing: "0.01em",
      borderLeft: "1px solid rgba(212,175,55,0.13)",
      paddingLeft: 18,
    }}>
      {words.map((word, i) => {
        const isDone = i < activeIdx;
        const isActive = i === activeIdx;
        return (
          <span
            key={i}
            style={{
              display: "inline",
              transition: "color 0.2s ease, text-shadow 0.2s ease",
              color: isDone
                ? "rgba(245,230,181,0.82)"
                : isActive
                  ? "#F0CC55"
                  : "rgba(245,230,181,0.25)",
              textShadow: isActive
                ? "0 0 22px rgba(212,175,55,0.55), 0 0 8px rgba(212,175,55,0.3)"
                : "none",
            }}
          >
            {word}{" "}
          </span>
        );
      })}
    </p>
  );
}

// ── Waveform ──────────────────────────────────────────────────────────────────
function Waveform({ progress, duration, onSeek }: { progress: number; duration: number; onSeek: (time: number) => void }) {
  const BARS = 40;
  const [heights] = useState(() =>
    Array.from({ length: BARS }, () => Math.random() * 0.65 + 0.18)
  );
  const activeBar = duration > 0 ? Math.floor((progress / duration) * BARS) : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex", alignItems: "center", gap: 2.5,
        height: 44, cursor: "pointer", marginBottom: 10, userSelect: "none",
      }}
    >
      {heights.map((h, i) => {
        const isPast = i < activeBar;
        const isActive = i === activeBar;
        return (
          <div key={i} style={{
            flex: 1,
            height: `${h * 100}%`,
            borderRadius: 3,
            background: isPast
              ? "linear-gradient(180deg,#D4AF37,#8B6914)"
              : isActive
                ? "#F8E88A"
                : "rgba(212,175,55,0.16)",
            transform: isActive ? "scaleY(1.18)" : "scaleY(1)",
            transition: "background 0.1s ease, transform 0.1s ease",
          }} />
        );
      })}
    </div>
  );
}

// ── AudioPlayer ───────────────────────────────────────────────────────────────
function AudioPlayer({ src, title, onProgress }: { src: string; title: string; onProgress?: (current: number, duration: number) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta = () => setDuration(audio.duration);
    const onTime = () => { setCurrent(audio.currentTime); onProgress?.(audio.currentTime, audio.duration); };
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
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (t: number) => {
    const audio = audioRef.current;
    if (audio) { audio.currentTime = t; setCurrent(t); }
  };

  const skip = (s: number) => {
    const audio = audioRef.current;
    if (audio) seek(Math.max(0, Math.min(duration, audio.currentTime + s)));
  };

  const changeVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(22,14,4,0.96),rgba(34,20,6,0.97))",
      border: "1px solid rgba(212,175,55,0.22)",
      borderRadius: 18,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 180, height: 180,
        background: "radial-gradient(circle,rgba(212,175,55,0.1) 0%,transparent 70%)",
        pointerEvents: "none",
      }} />
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "linear-gradient(135deg,#D4AF37,#8B6914)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
        }}>🎧</div>
        <div>
          <p style={{ margin: "0 0 3px", fontSize: 9, color: "rgba(212,175,55,0.55)", letterSpacing: ".14em", textTransform: "uppercase" }}>Now Playing</p>
          <p style={{ margin: 0, fontSize: 13, color: "#F5E6B5", fontWeight: 600, fontFamily: "'Cormorant Garamond',serif", letterSpacing: ".04em" }}>{title}</p>
        </div>
      </div>

      <Waveform progress={current} duration={duration} onSeek={seek} />

      {/* timestamps */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: "rgba(212,175,55,0.5)", fontFamily: "monospace" }}>{fmt(current)}</span>
        <span style={{ fontSize: 10, color: "rgba(212,175,55,0.3)", fontFamily: "monospace" }}>{fmt(duration)}</span>
      </div>

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 }}>
        <button onClick={() => skip(-10)} style={{ background: "none", border: "none", color: "rgba(212,175,55,0.6)", cursor: "pointer", padding: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 9, letterSpacing: ".05em" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
          -10s
        </button>

        <button onClick={toggle} style={{
          width: 50, height: 50, borderRadius: "50%",
          background: "linear-gradient(135deg,#D4AF37,#8B6914)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 26px rgba(212,175,55,0.32),0 4px 14px rgba(0,0,0,0.4)",
          flexShrink: 0,
        }}>
          {playing
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
          }
        </button>

        <button onClick={() => skip(10)} style={{ background: "none", border: "none", color: "rgba(212,175,55,0.6)", cursor: "pointer", padding: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 9, letterSpacing: ".05em" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" /></svg>
          +10s
        </button>
      </div>

      {/* volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={toggleMute} style={{ background: "none", border: "none", color: "rgba(212,175,55,0.5)", cursor: "pointer", padding: 3, flexShrink: 0 }}>
          {muted || volume === 0
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-17-9L2 4.27 9 11.27V15H6l-4 4v-8H0v-4h6V5.73L4.27 4 3 2.73z" /></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
          }
        </button>
        <div style={{ flex: 1, position: "relative", height: 3, background: "rgba(212,175,55,0.1)", borderRadius: 2 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(muted ? 0 : volume) * 100}%`, background: "linear-gradient(90deg,#8B6914,#D4AF37)", borderRadius: 2 }} />
          <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={changeVol}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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

export default function ActivityDetailPage({ activity, destination }: { activity: Activity | null; destination?: Destination | null }) {
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);

  const handleProgress = useCallback((cur: number, dur: number) => {
    setAudioProgress(cur);
    setAudioDuration(dur);
  }, []);

  // preload bg image
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

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: "#F5E6B5",
      background: "#080501",
    }}>
      {/* ── Background image ── */}
      {activity.image_url && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: `url(${activity.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.35) saturate(0.65)",
          transform: "scale(1.06)",
          opacity: bgLoaded ? 1 : 0,
          transition: "opacity 1s ease",
        }} />
      )}

      {/* noise texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, opacity: 0.05, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px",
      }} />
      {/* vignette */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, background: "radial-gradient(ellipse at center,transparent 25%,rgba(5,3,1,0.8) 100%)", pointerEvents: "none" }} />
      {/* bottom fade */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "60%", zIndex: 2, background: "linear-gradient(to top,rgba(8,5,1,1) 0%,rgba(8,5,1,0.7) 45%,transparent 100%)", pointerEvents: "none" }} />
      {/* top fade */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "25%", zIndex: 2, background: "linear-gradient(to bottom,rgba(8,5,1,0.65) 0%,transparent 100%)", pointerEvents: "none" }} />

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 3, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 32px" }}>
          <Link href="/activities" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            color: "rgba(245,230,181,0.7)", textDecoration: "none",
            fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase",
            background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)",
            padding: "7px 18px", borderRadius: 50,
            border: "1px solid rgba(212,175,55,0.18)",
          }}>← Back</Link>
          <div style={{ display: "flex", gap: 8 }}>
            {activity.category && (
              <span style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37", fontSize: 10, letterSpacing: ".15em", padding: "5px 14px", borderRadius: 50, textTransform: "uppercase" }}>{activity.category}</span>
            )}
            {activity.type && (
              <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(245,230,181,0.65)", fontSize: 10, letterSpacing: ".12em", padding: "5px 14px", borderRadius: 50, textTransform: "uppercase" }}>{activity.type}</span>
            )}
          </div>
        </div>

        {/* hero */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", padding: "0 32px 36px" }}>
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 10, letterSpacing: ".3em", color: "rgba(212,175,55,0.65)", textTransform: "uppercase" }}>Activity Details</p>
            <h1 style={{
              margin: "0 0 14px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem,5vw,3.4rem)",
              fontWeight: 700, letterSpacing: ".03em", lineHeight: 1.08,
              textShadow: "0 3px 30px rgba(0,0,0,0.7)",
            }}>{activity.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#D4AF37", fontSize: 18, letterSpacing: 2 }}>{stars}</span>
              <span style={{ fontSize: 12, color: "rgba(245,230,181,0.4)" }}>{rating} / 5</span>
              {activity.price && (
                <span style={{
                  background: "linear-gradient(135deg,rgba(212,175,55,0.2),rgba(139,105,20,0.15))",
                  border: "1px solid rgba(212,175,55,0.28)",
                  color: "#D4AF37", fontSize: 13, padding: "4px 14px", borderRadius: 50,
                }}>{activity.price} EGP</span>
              )}
            </div>
          </div>
        </div>

        {/* body */}
        <div style={{
          background: "linear-gradient(to bottom,rgba(8,5,1,0) 0%,rgba(8,5,1,1) 5%)",
          padding: "0 32px 64px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "start", maxWidth: 1100, margin: "0 auto" }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* karaoke description */}
              {activity.description && (
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 22, background: "linear-gradient(180deg,#D4AF37,#8B6914)", borderRadius: 2 }} />
                    <span style={{ fontSize: 9, letterSpacing: ".25em", color: "rgba(212,175,55,0.6)", textTransform: "uppercase" }}>About This Activity</span>
                  </div>
                  <KaraokeText text={activity.description} progress={audioProgress} duration={audioDuration} />
                </section>
              )}

              {/* audio player */}
              {activity.audio_url && (
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 22, background: "linear-gradient(180deg,#D4AF37,#8B6914)", borderRadius: 2 }} />
                    <span style={{ fontSize: 9, letterSpacing: ".25em", color: "rgba(212,175,55,0.6)", textTransform: "uppercase" }}>Audio Guide</span>
                  </div>
                  <AudioPlayer src={activity.audio_url} title={activity.name} onProgress={handleProgress} />
                </section>
              )}

              {/* location */}
              {activity.latitude && activity.longitude && (
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 22, background: "linear-gradient(180deg,#D4AF37,#8B6914)", borderRadius: 2 }} />
                    <span style={{ fontSize: 9, letterSpacing: ".25em", color: "rgba(212,175,55,0.6)", textTransform: "uppercase" }}>Location</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10,
                      height: 140, background: "rgba(212,175,55,0.04)",
                      border: "1px solid rgba(212,175,55,0.15)",
                      borderRadius: 16, textDecoration: "none", color: "rgba(212,175,55,0.65)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.09)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.32)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,55,0.04)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)"; }}
                  >
                    <span style={{ fontSize: 28 }}>📍</span>
                    <span style={{ fontSize: 12, letterSpacing: ".06em" }}>{Number(activity.latitude).toFixed(4)}, {Number(activity.longitude).toFixed(4)}</span>
                    <span style={{ fontSize: 10, color: "rgba(212,175,55,0.35)", letterSpacing: ".12em" }}>OPEN IN GOOGLE MAPS ↗</span>
                  </a>
                </section>
              )}
            </div>

            {/* RIGHT — sticky sidebar */}
            <aside style={{ position: "sticky", top: 24 }}>
              <div style={{
                background: "linear-gradient(160deg,rgba(22,14,4,0.92),rgba(14,9,2,0.96))",
                border: "1px solid rgba(212,175,55,0.18)",
                borderRadius: 18, overflow: "hidden",
              }}>
                <div style={{ background: "linear-gradient(90deg,rgba(212,175,55,0.1),transparent)", borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "13px 20px" }}>
                  <p style={{ margin: 0, fontSize: 9, letterSpacing: ".25em", color: "rgba(212,175,55,0.5)", textTransform: "uppercase" }}>Quick Facts</p>
                </div>
                {[
                  { icon: "🏛", label: "Destination", value: destination?.name || activity.destination_name },
                  { icon: "🎯", label: "Type", value: activity.type },
                  { icon: "📌", label: "Category", value: activity.category },
                  { icon: "🗺", label: "Tourism Type", value: activity.tourism_type || "—" },
                  { icon: "💰", label: "Price", value: activity.price ? `${activity.price} EGP` : "Free" },
                  { icon: "⭐", label: "Rating", value: activity.rating ? `${stars} (${activity.rating})` : "—", gold: true },
                  { icon: "📍", label: "Coordinates", value: activity.latitude ? `${Number(activity.latitude).toFixed(4)}, ${Number(activity.longitude).toFixed(4)}` : "—", small: true },
                ].filter((r: any) => r.value).map((row: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 20px", borderBottom: "1px solid rgba(212,175,55,0.06)" }}>
                    <span style={{ fontSize: 13, marginTop: 2, flexShrink: 0 }}>{row.icon}</span>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 8.5, letterSpacing: ".13em", color: "rgba(212,175,55,0.42)", textTransform: "uppercase" }}>{row.label}</p>
                      <p style={{ margin: 0, fontSize: row.small ? 11 : 13, color: row.gold ? "#D4AF37" : "#F5E6B5", lineHeight: 1.3, fontFamily: "'Cormorant Garamond',serif" }}>{row.value}</p>
                    </div>
                  </div>
                ))}
                {destination && (
                  <div style={{ padding: "14px 20px" }}>
                    <Link href={`/destinations/${activity.destination_id}`} style={{
                      display: "block", textAlign: "center",
                      background: "linear-gradient(135deg,#D4AF37,#8B6914)",
                      color: "#1A0F00", textDecoration: "none",
                      padding: "11px 16px", borderRadius: 10,
                      fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                      fontFamily: "'Cormorant Garamond',serif",
                    }}>Explore Destination →</Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
