"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";

type Stat = {
  value: string;
  label: string;
};

type Pillar = {
  id: string;
  title: string;
  description: string;
};

type Milestone = {
  year: string;
  title: string;
  detail: string;
};

type TeamMember = {
  name: string;
  role: string;
};

const stats: Stat[] = [
  { value: "5", label: "Tourism Categories" },
  { value: "30+", label: "Destinations Curated" },
  { value: "7000", label: "Years of Heritage" },
  { value: "24/7", label: "Planning Access" },
];

const pillars: Pillar[] = [
  {
    id: "01",
    title: "Curated and Clear",
    description:
      "Every destination is selected with practical context so travelers can choose faster and better.",
  },
  {
    id: "02",
    title: "Culture First",
    description:
      "We frame each route through Egypt's identity, not just itinerary checklists.",
  },
  {
    id: "03",
    title: "Responsible Travel",
    description:
      "From protected reefs to ancient temples, we encourage discovery that preserves place and people.",
  },
  {
    id: "04",
    title: "Built for Action",
    description:
      "Inspiration, comparison, and planning are connected in one flow from idea to trip plan.",
  },
];

const milestones: Milestone[] = [
  {
    year: "01",
    title: "Discover",
    detail:
      "Start with themed tourism categories to match your travel style and season.",
  },
  {
    year: "02",
    title: "Compare",
    detail:
      "Review destination highlights, regions, and practical travel details side by side.",
  },
  {
    year: "03",
    title: "Plan",
    detail:
      "Build an itinerary with balanced heritage, nature, sea, and religious heritage moments.",
  },
];

const team: TeamMember[] = [
  { name: "Shahd Hamed", role: "Project Lead and Business" },
  { name: "Marwan Ahmed", role: "Frontend Development" },
  { name: "Basmala Hany", role: "Frontend Development" },
  { name: "Ahmed Hossam", role: "Backend Development" },
  { name: "Maram Ehab", role: "Backend Development" },
  { name: "Adel Mina", role: "System Analysis" },
];

const statsAr: Stat[] = [
  { value: "6", label: "انواع سياحة" },
  { value: "30+", label: "وجهة مختارة" },
  { value: "7000", label: "سنوات من التراث" },
  { value: "24/7", label: "وصول دائم للتخطيط" },
];

const pillarsAr: Pillar[] = [
  {
    id: "01",
    title: "اختيار دقيق وواضح",
    description: "كل وجهة يتم اختيارها بسياق عملي ليسهل عليك اتخاذ القرار بسرعة.",
  },
  {
    id: "02",
    title: "الثقافة اولا",
    description: "نقدم كل مسار بروح مصر وهويتها وليس مجرد قائمة زيارات.",
  },
  {
    id: "03",
    title: "سفر مسؤول",
    description: "من الشعاب المرجانية الى المعابد القديمة، نشجع اكتشافا يحافظ على المكان والناس.",
  },
  {
    id: "04",
    title: "مصمم للتنفيذ",
    description: "الالهام والمقارنة والتخطيط في رحلة واحدة من الفكرة الى برنامج السفر.",
  },
];

const milestonesAr: Milestone[] = [
  {
    year: "01",
    title: "اكتشف",
    detail: "ابدأ بتصنيفات سياحية تناسب اسلوب سفرك والموسم.",
  },
  {
    year: "02",
    title: "قارن",
    detail: "راجع المعالم والمناطق والتفاصيل العملية بشكل مباشر.",
  },
  {
    year: "03",
    title: "خطط",
    detail: "ابن برنامجا متوازنا يجمع التراث والطبيعة والبحر والتراث الديني.",
  },
];

const teamAr: TeamMember[] = [
  { name: "Shahd Hamed", role: "قائدة المشروع والاعمال" },
  { name: "Marwan Ahmed", role: "تطوير الواجهة الامامية" },
  { name: "Basmala Hany", role: "تطوير الواجهة الامامية" },
  { name: "Ahmed Hossam", role: "تطوير الخلفية" },
  { name: "Maram Ehab", role: "تطوير الخلفية" },
  { name: "Adel Mina", role: "تحليل النظم" },
];

function useInView<T extends HTMLElement>(threshold = 0.15): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function AnimatedCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [ref, visible] = useInView<HTMLDivElement>(0.1);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [heroReady, setHeroReady] = useState(false);
  const localizedStats = isAr ? statsAr : stats;
  const localizedPillars = isAr ? pillarsAr : pillars;
  const localizedMilestones = isAr ? milestonesAr : milestones;
  const localizedTeam = isAr ? teamAr : team;
  const copy = {
    heroEyebrow: isAr ? "قصة Egypt Panorama" : "Egypt Panorama Story",
    heroTitleLine1: isAr ? "منصة صنعت" : "Crafted For Deeper",
    heroTitleLine2: isAr ? "لرحلات مصرية اعمق" : "Egyptian Journeys",
    heroDescription: isAr
      ? "تم بناء Egypt Panorama ليجعل اكتشاف السياحة مقصودا وعمليا من اول الهام حتى برنامج الرحلة النهائي."
      : "Egypt Panorama was built to make tourism discovery intentional, elegant, and practical - from first inspiration to final itinerary.",
    startPlanning: isAr ? "ابدأ التخطيط" : "Start Planning",
    viewDestinations: isAr ? "عرض الوجهات" : "View Destinations",
    scroll: isAr ? "مرر" : "Scroll",
    mission: isAr ? "الرسالة" : "Mission",
    missionTitleStart: isAr ? "منصة متكاملة تجمع" : "One Premium Platform For",
    missionTitleEnd: isAr ? "الثقافة والطبيعة والتخطيط" : "Culture, Nature, and Planning",
    missionDescription: isAr
      ? "نجمع جودة المحتوى وعمق السياحة وادوات التخطيط في واجهة واحدة تجعل مصر جميلة وسهلة في نفس الوقت."
      : "We merge editorial quality, tourism depth, and planning tools in one interface - so Egypt is not only beautiful to browse, but easy to experience.",
    howItWorks: isAr ? "كيف تعمل" : "How It Works",
    step: isAr ? "الخطوة" : "Step",
    team: isAr ? "الفريق" : "Team",
    ctaTitle: isAr ? "جاهز لتشكيل مسارك عبر مصر؟" : "Ready To Shape Your Route Across Egypt?",
    ctaDescription: isAr
      ? "افتح مخطط الرحلات لتحويل اهتماماتك الى برنامج متوازن قابل للتنفيذ."
      : "Open the trip planner to turn your destination interests into a balanced, bookable path.",
    openPlanner: isAr ? "فتح المخطط" : "Open Planner",
    exploreCulture: isAr ? "استكشف الثقافة" : "Explore Culture",
  };

  useEffect(() => {
    const id = window.setTimeout(() => setHeroReady(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;1,400&display=swap');
        .about-root, .about-root * { box-sizing: border-box; }
        .about-root {
          background: #0D0A06;
          color: #F7F0E3;
          min-height: 100vh;
          font-family: 'Lora', serif;
        }
        @keyframes aboutFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
      `}</style>

      <div className="about-root">
        <section
          style={{
            position: "relative",
            minHeight: "82vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/images/hero/pyramids.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 45%",
              filter: "brightness(0.35) saturate(0.8)",
              transform: "scale(1.04)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(13,10,6,0.48) 0%, rgba(13,10,6,0.2) 35%, rgba(13,10,6,0.92) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.035,
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(232,160,0,1) 79px, rgba(232,160,0,1) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(232,160,0,1) 79px, rgba(232,160,0,1) 80px)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: "1180px",
              padding: "4rem 1.4rem 4.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.72rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "#E8A000",
                marginBottom: "1.8rem",
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 0.8s ease, transform 0.8s ease",
              }}
            >
              {copy.heroEyebrow}
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: "'Cinzel Decorative', serif",
                fontWeight: 900,
                fontSize: "clamp(2.2rem, 6.8vw, 5rem)",
                lineHeight: 1.1,
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(22px)",
                transition: "opacity 0.9s ease 0.12s, transform 0.9s ease 0.12s",
              }}
            >
              {copy.heroTitleLine1}
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #E8C97A, #E8A000, #C9762A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {copy.heroTitleLine2}
              </span>
            </h1>

            <p
              style={{
                margin: "1.3rem auto 0",
                maxWidth: "760px",
                fontSize: "clamp(0.95rem, 1.8vw, 1.14rem)",
                lineHeight: 1.85,
                color: "rgba(247,240,227,0.66)",
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.9s ease 0.25s, transform 0.9s ease 0.25s",
              }}
            >
              {copy.heroDescription}
            </p>

            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                flexWrap: "wrap",
                opacity: heroReady ? 1 : 0,
                transition: "opacity 0.8s ease 0.35s",
              }}
            >
              <Link
                href="/plan"
                style={{
                  textDecoration: "none",
                  borderRadius: "999px",
                  padding: "0.85rem 1.45rem",
                  background: "linear-gradient(135deg, #E8A000, #C9A84C)",
                  color: "#0D0A06",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.17em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {copy.startPlanning}
              </Link>

              <Link
                href="/destinations"
                style={{
                  textDecoration: "none",
                  borderRadius: "999px",
                  padding: "0.85rem 1.45rem",
                  border: "1px solid rgba(255,255,255,0.24)",
                  color: "#F7F0E3",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.17em",
                  textTransform: "uppercase",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {copy.viewDestinations}
              </Link>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "1.8rem",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(232,160,0,0.65)",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.56rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              animation: "aboutFloat 2s ease-in-out infinite",
            }}
          >
            {copy.scroll}
          </div>
        </section>

        <section style={{ padding: "3.3rem 1.2rem 1.2rem" }}>
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {localizedStats.map((item, i) => (
              <AnimatedCard key={item.label} delay={i * 0.06}>
                <article
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "12px",
                    padding: "1rem 1rem 1.1rem",
                    minHeight: "104px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      color: "#E8A000",
                      fontSize: "1.55rem",
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      marginTop: "0.45rem",
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.63rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(247,240,227,0.45)",
                    }}
                  >
                    {item.label}
                  </div>
                </article>
              </AnimatedCard>
            ))}
          </div>
        </section>

        <section style={{ padding: "2rem 1.2rem 1rem" }}>
          <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
            <AnimatedCard>
              <div
                style={{
                  border: "1px solid rgba(232,160,0,0.2)",
                  background: "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  borderRadius: "14px",
                  padding: "1.4rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.62rem",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "#E8A000",
                    marginBottom: "0.8rem",
                  }}
                >
                  {copy.mission}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: "clamp(1.45rem, 4.2vw, 2.7rem)",
                    lineHeight: 1.2,
                  }}
                >
                  {copy.missionTitleStart}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #E8C97A, #E8A000)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {" "}
                    {copy.missionTitleEnd}
                  </span>
                </h2>
                <p
                  style={{
                    marginTop: "0.9rem",
                    marginBottom: 0,
                    color: "rgba(247,240,227,0.62)",
                    lineHeight: 1.85,
                    fontSize: "0.95rem",
                    maxWidth: "880px",
                  }}
                >
                  {copy.missionDescription}
                </p>
              </div>
            </AnimatedCard>
          </div>
        </section>

        <section style={{ padding: "1.4rem 1.2rem 1rem" }}>
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(228px, 1fr))",
              gap: "0.85rem",
            }}
          >
            {localizedPillars.map((pillar, i) => (
              <AnimatedCard key={pillar.id} delay={i * 0.05}>
                <article
                  style={{
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "1rem",
                    background: "#120E08",
                    minHeight: "176px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.62rem",
                      letterSpacing: "0.24em",
                      color: "#E8A000",
                    }}
                  >
                    {pillar.id}
                  </div>
                  <h3
                    style={{
                      margin: "0.5rem 0 0",
                      fontFamily: "'Cinzel', serif",
                      color: "#F7F0E3",
                      fontSize: "1rem",
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    style={{
                      marginTop: "0.55rem",
                      marginBottom: 0,
                      color: "rgba(247,240,227,0.52)",
                      lineHeight: 1.75,
                      fontSize: "0.86rem",
                    }}
                  >
                    {pillar.description}
                  </p>
                </article>
              </AnimatedCard>
            ))}
          </div>
        </section>

        <section style={{ padding: "1.4rem 1.2rem 1rem" }}>
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.02)",
              padding: "1.2rem 1rem",
            }}
          >
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.62rem",
                color: "#E8A000",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                marginBottom: "0.8rem",
              }}
            >
              {copy.howItWorks}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "0.8rem",
              }}
            >
              {localizedMilestones.map((item, i) => (
                <AnimatedCard key={item.year} delay={i * 0.06}>
                  <article
                    style={{
                      border: "1px solid rgba(232,160,0,0.2)",
                      background: "rgba(232,160,0,0.05)",
                      borderRadius: "10px",
                      padding: "0.95rem",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: "0.6rem",
                        color: "rgba(247,240,227,0.55)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      {copy.step} {item.year}
                    </div>
                    <h3
                      style={{
                        margin: "0.45rem 0 0",
                        fontFamily: "'Cinzel', serif",
                        color: "#E8C97A",
                        fontSize: "0.96rem",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.45rem",
                        marginBottom: 0,
                        color: "rgba(247,240,227,0.52)",
                        lineHeight: 1.7,
                        fontSize: "0.84rem",
                      }}
                    >
                      {item.detail}
                    </p>
                  </article>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "1.4rem 1.2rem 1rem" }}>
          <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.62rem",
                color: "#E8A000",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                marginBottom: "0.6rem",
              }}
            >
              {copy.team}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "0.8rem",
              }}
            >
              {localizedTeam.map((member, i) => (
                <AnimatedCard key={member.name} delay={i * 0.04}>
                  <article
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#110D07",
                      borderRadius: "10px",
                      padding: "0.95rem",
                      minHeight: "92px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: "#F7F0E3",
                        fontSize: "0.95rem",
                      }}
                    >
                      {member.name}
                    </div>
                    <div
                      style={{
                        marginTop: "0.25rem",
                        color: "rgba(247,240,227,0.54)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {member.role}
                    </div>
                  </article>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "2rem 1.2rem 4.2rem" }}>
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              borderRadius: "14px",
              border: "1px solid rgba(232,160,0,0.22)",
              background: "linear-gradient(130deg, #120E07 0%, #1A1308 45%, #102333 100%)",
              padding: "1.4rem",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(1.2rem, 4vw, 2.35rem)",
                color: "#F7F0E3",
                lineHeight: 1.23,
              }}
            >
              {copy.ctaTitle}
            </h2>
            <p
              style={{
                marginTop: "0.75rem",
                marginBottom: 0,
                color: "rgba(247,240,227,0.62)",
                lineHeight: 1.8,
                fontSize: "0.9rem",
                maxWidth: "700px",
              }}
            >
              {copy.ctaDescription}
            </p>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.65rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/plan"
                style={{
                  textDecoration: "none",
                  borderRadius: "7px",
                  padding: "0.74rem 1.1rem",
                  background: "linear-gradient(135deg, #E8A000, #C9A84C)",
                  color: "#0D0A06",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {copy.openPlanner}
              </Link>

              <Link
                href="/tourism/cultural"
                style={{
                  textDecoration: "none",
                  borderRadius: "7px",
                  padding: "0.74rem 1.1rem",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#F7F0E3",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {copy.exploreCulture}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
