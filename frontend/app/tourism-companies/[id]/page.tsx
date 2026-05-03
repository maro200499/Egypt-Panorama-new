"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { apiFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Company {
  company_id: number;
  comp_name: string;
  comp_phone: string;
  comp_email: string;
  comp_address: string;
  city: string;
  rating: number | string | null;
  description: string;
  image_url: string;
}

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number | string | null | undefined }) {
  const normalizedRating = typeof rating === "number" ? rating : Number.parseFloat(String(rating ?? 0));
  const displayRating = Number.isFinite(normalizedRating) ? normalizedRating : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayRating >= star;
        const half = !filled && displayRating >= star - 0.5;
        return (
          <svg
            key={star}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={filled ? "#c9a84c" : half ? "url(#half)" : "none"}
            stroke="#c9a84c"
            strokeWidth="1.5"
          >
            {half && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#c9a84c" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        );
      })}
      <span style={{ color: "#c9a84c", fontWeight: 600, fontSize: "14px", marginLeft: "4px" }}>
        {displayRating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", padding: "0" }}>
      <div
        style={{
          height: "420px",
          background: "linear-gradient(135deg, #161625 0%, #1a1a2e 100%)",
          animation: "pulse 1.5s infinite",
        }}
      />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "80px",
              background: "#161625",
              borderRadius: "12px",
              marginBottom: "1rem",
              animation: "pulse 1.5s infinite",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompanyDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const data = await apiFetch<Record<string, unknown>>(`/companies/get_one.php?id=${encodeURIComponent(
          String(id)
        )}`);

        setCompany(data as unknown as Company);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load company data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) return <Skeleton />;

  if (error || !company) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "1rem" }}>🏛️</div>
        <h1 style={{ fontSize: "24px", marginBottom: "0.5rem" }}>Company Not Found</h1>
        <p style={{ color: "#888", marginBottom: "2rem" }}>
          {error || "This company doesn't exist in our records."}
        </p>
        <Link
          href="/tourism-companies"
          style={{
            background: "#c9a84c",
            color: "#0d0d1a",
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Back to Companies
        </Link>
      </div>
    );
  }

  const infoRows = [
    { icon: "📍", label: "Address", value: company.comp_address },
    { icon: "🏙️", label: "City", value: company.city },
    {
      icon: "📞",
      label: "Phone",
      value: (
        <a href={`tel:${company.comp_phone}`} style={{ color: "#c9a84c", textDecoration: "none" }}>
          {company.comp_phone}
        </a>
      ),
    },
    {
      icon: "✉️",
      label: "Email",
      value: (
        <a href={`mailto:${company.comp_email}`} style={{ color: "#c9a84c", textDecoration: "none" }}>
          {company.comp_email}
        </a>
      ),
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d1a; font-family: 'Segoe UI', system-ui, sans-serif; }

        .hero {
          position: relative;
          height: 460px;
          overflow: hidden;
        }
        .hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13,13,26,0.95) 0%, rgba(13,13,26,0.5) 50%, rgba(13,13,26,0.2) 100%);
        }
        .hero-content {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 1100px;
          padding: 0 1.5rem;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.75rem;
        }
        .breadcrumb a { color: rgba(255,255,255,0.5); text-decoration: none; }
        .breadcrumb a:hover { color: #c9a84c; }
        .breadcrumb span { color: rgba(255,255,255,0.25); }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.4);
          color: #c9a84c;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 0.75rem;
        }
        .hero-title {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 0.75rem;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .page-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr; }
          .hero { height: 320px; }
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 0.5rem;
        }
        .section-title {
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 1rem;
          padding-left: 12px;
          border-left: 3px solid #c9a84c;
        }
        .about-text {
          color: rgba(255,255,255,0.7);
          font-size: 15px;
          line-height: 1.85;
        }

        .info-card {
          background: #161625;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
        }
        .info-card-header {
          background: linear-gradient(135deg, #1e1e35, #1a1a2e);
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .info-card-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.2s;
        }
        .info-row:last-child { border-bottom: none; }
        .info-row:hover { background: rgba(255,255,255,0.03); }
        .info-icon {
          font-size: 16px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201,168,76,0.1);
          border-radius: 6px;
          flex-shrink: 0;
        }
        .info-label {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        .info-value {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
          font-weight: 400;
          line-height: 1.4;
        }

        .actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #c9a84c;
          color: #0d0d1a;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover { background: #d4b45a; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(201,168,76,0.3); }
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #c9a84c;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          border: 1px solid rgba(201,168,76,0.5);
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-outline:hover { background: rgba(201,168,76,0.08); border-color: #c9a84c; }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 2.5rem 0;
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="hero">
        <img
          src={company.image_url || "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200"}
          alt={company.comp_name}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200";
          }}
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tourism-companies">Tourism Companies</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{company.comp_name}</span>
          </nav>
          <div className="hero-badge">🏢 Tourism Company</div>
          <h1 className="hero-title">{company.comp_name}</h1>
          <StarRating rating={company.rating || 4.2} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="page-body">
        <div className="two-col">

          {/* Left — About */}
          <div>
            <p className="section-label">Overview</p>
            <h2 className="section-title">About This Company</h2>
            <p className="about-text">
              {company.description || "A trusted tourism company dedicated to providing exceptional travel experiences across Egypt."}
            </p>

            <div className="divider" />

            {/* Action Buttons */}
            <div className="actions">
              <Link href={`/plan?company=${encodeURIComponent(company.comp_name)}`} className="btn-primary">
                🗺️ Plan with this Company
              </Link>
              <a href={`mailto:${company.comp_email}`} className="btn-outline">
                ✉️ Contact Us
              </a>
            </div>
          </div>

          {/* Right — Quick Info */}
          <div className="info-card">
            <div className="info-card-header">
              <h3>Quick Info</h3>
              <StarRating rating={company.rating || 4.2} />
            </div>
            {infoRows.map((row, i) => (
              <div className="info-row" key={i}>
                <div className="info-icon">{row.icon}</div>
                <div>
                  <div className="info-label">{row.label}</div>
                  <div className="info-value">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
