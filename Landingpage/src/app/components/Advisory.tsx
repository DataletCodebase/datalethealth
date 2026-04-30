import { useState } from "react";
import { motion } from "framer-motion";

// ── Hierarchy ────────────────────────────────────────────────────
// Tier 1 — Chairman / Apex (1 person, centred)
// Tier 2 — Senior Advisors (3 people)
// Tier 3 — Expert Advisors (3 people)

const tier1 = [
  {
    id: 1,
    name: "Prahlada Rama Rao",
    role: "Chairman, Advisory Board",
    title: "Former Director, DRDL (DRDO)",
    desc: "Renowned aerospace engineer known for contributions to India's space and defence programs. Awarded Padma Shri (2015).",
    tag: "Padma Shri",
    icon: "🏛️",
  },
];

const tier2 = [
  {
    id: 2,
    name: "Dr. Ranjib Ghosh",
    role: "Professor & HOD, Pharmacology",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Leading pharmacologist driving evidence-based therapeutic research and clinical education.",
    tag: "Pharmacology",
    icon: "🔬",
  },
  {
    id: 3,
    name: "Dr. A. K. Chakma",
    role: "HOD, Ophthalmology",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Renowned ophthalmologist with decades of clinical excellence in eye care and surgical innovation.",
    tag: "Ophthalmology",
    icon: "👁️",
  },
  {
    id: 4,
    name: "Dr. Rajib Debnath",
    role: "HOD, Orthopedic Department",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Expert orthopaedic surgeon specialising in joint reconstruction and musculoskeletal health outcomes.",
    tag: "Orthopedics",
    icon: "🦴",
  },
];

const tier3 = [
  {
    id: 5,
    name: "Dr. Santanu Ghosh",
    role: "Associate Professor, Psychiatry",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Mental health specialist integrating clinical psychiatry with patient-centred digital care pathways.",
    tag: "Psychiatry",
    icon: "🧠",
  },
  {
    id: 6,
    name: "Ms. Anmayee Nanda",
    role: "Senior Dietitian",
    title: "Hi-Tech Medical College · Former Apollo & Sunshine",
    desc: "Certified clinical dietitian with expertise in therapeutic nutrition and preventive wellness programs.",
    tag: "Nutrition",
    icon: "🥗",
  },
  {
    id: 7,
    name: "Mr. Niloy Dey",
    role: "Certified Nutritionist & Trainer",
    title: "Owner, Gladiator Fitness",
    desc: "Performance nutrition and fitness expert empowering individuals through science-backed training methodologies.",
    tag: "Fitness",
    icon: "💪",
  },
];

// ── Connector ────────────────────────────────────────────────────
function TierConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center my-1">
      <div
        style={{
          width: 1.5,
          height: 20,
          background: "linear-gradient(to bottom,#C084FC,#8B00DC)",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "6px 0",
        }}
      >
        <div
          style={{
            height: 1,
            width: 48,
            background: "linear-gradient(90deg,transparent,#C084FC)",
          }}
        />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#9898A8",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div
          style={{
            height: 1,
            width: 48,
            background: "linear-gradient(90deg,#C084FC,transparent)",
          }}
        />
      </div>
      <div
        style={{
          width: 1.5,
          height: 20,
          background: "linear-gradient(to bottom,#8B00DC,#C084FC)",
          opacity: 0.4,
        }}
      />
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────
type TierLevel = 1 | 2 | 3;

interface Advisor {
  id: number;
  name: string;
  role: string;
  title: string;
  desc: string;
  tag: string;
  icon: string;
}

function AdvisorCard({
  advisor,
  tier,
  index,
}: {
  advisor: Advisor;
  tier: TierLevel;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const sizes = {
    1: { name: 20, role: 14, icon: 48, padding: "36px 32px 30px" },
    2: { name: 16, role: 13, icon: 40, padding: "28px 24px 24px" },
    3: { name: 15, role: 12, icon: 36, padding: "24px 20px 20px" },
  };
  const s = sizes[tier];
  const delay = index * 0.09 + (tier - 1) * 0.18;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: tier === 1 ? 22 : 16,
        padding: s.padding,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        border: hovered
          ? "1.5px solid #8B00DC"
          : tier === 1
            ? "1.5px solid #D8B4FE"
            : "1.5px solid #E8E0F5",
        boxShadow: hovered
          ? "0 24px 64px rgba(123,0,204,0.16), 0 4px 16px rgba(0,0,0,0.06)"
          : tier === 1
            ? "0 8px 36px rgba(123,0,204,0.12), 0 2px 8px rgba(0,0,0,0.04)"
            : "0 2px 16px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        transition: "all 0.32s cubic-bezier(0.22,1,0.36,1)",
        cursor: "default",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: tier === 1 ? 4 : tier === 2 ? 3 : 2,
          background:
            tier === 1
              ? "linear-gradient(90deg,#7B00CC,#CC00FF)"
              : hovered
                ? "linear-gradient(90deg,transparent,#8B00DC,transparent)"
                : "linear-gradient(90deg,transparent,#C084FC,transparent)",
          opacity: tier === 1 ? 1 : hovered ? 0.75 : 0.22,
          transition: "opacity 0.3s",
        }}
      />

      {/* Tag badge */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: tier === 1 ? "#fff" : "#7B00CC",
          background:
            tier === 1 ? "linear-gradient(135deg,#7B00CC,#CC00FF)" : "#f3e8ff",
          padding: "3px 9px",
          borderRadius: 100,
          border: tier === 1 ? "none" : "1px solid #E8D9FF",
        }}
      >
        {advisor.tag}
      </div>

      {/* Icon circle */}
      <div
        style={{
          width: s.icon,
          height: s.icon,
          borderRadius: 12,
          background: hovered
            ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
            : tier === 1
              ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
              : "#f3e8ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s.icon * 0.46,
          marginBottom: 16,
          transition: "all 0.3s ease",
          boxShadow: hovered
            ? "0 6px 20px rgba(123,0,204,0.28)"
            : tier === 1
              ? "0 4px 16px rgba(123,0,204,0.22)"
              : "none",
          flexShrink: 0,
        }}
      >
        {advisor.icon}
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: s.name,
          fontWeight: tier === 1 ? 900 : tier === 2 ? 800 : 700,
          color: "#0D0D0D",
          lineHeight: 1.2,
          marginBottom: 5,
          letterSpacing: tier === 1 ? -0.5 : 0,
        }}
      >
        {advisor.name}
      </h3>

      {/* Role pill */}
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          fontSize: s.role - 1,
          fontWeight: 700,
          color: "#7B00CC",
          background: "#FAF7FF",
          border: "1px solid #E8D9FF",
          padding: "3px 10px",
          borderRadius: 100,
          marginBottom: 6,
          letterSpacing: 0.1,
        }}
      >
        {advisor.role}
      </div>

      {/* Institution */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#9898A8",
          marginBottom: 12,
          letterSpacing: 0.1,
        }}
      >
        {advisor.title}
      </p>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: hovered
            ? "linear-gradient(90deg,transparent,#C084FC,transparent)"
            : "#F0EAFF",
          marginBottom: 12,
          transition: "background 0.3s",
        }}
      />

      {/* Description */}
      <p
        style={{
          fontSize: 12.5,
          color: "#5A5A72",
          lineHeight: 1.65,
          flexGrow: 1,
        }}
      >
        {advisor.desc}
      </p>

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg,transparent,#8B00DC,transparent)",
          opacity: hovered ? 0.45 : 0.05,
          transition: "opacity 0.3s",
        }}
      />
    </motion.div>
  );
}

// ── Main Export ──────────────────────────────────────────────────
export function Advisory() {
  return (
    <section
      id="advisory"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#FAF7FF",
        padding: "90px 24px 120px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle,#E9D5FF 0%,transparent 65%)",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -100,
          width: 440,
          height: 440,
          borderRadius: "50%",
          background: "radial-gradient(circle,#DDD6FE 0%,transparent 65%)",
          opacity: 0.32,
          pointerEvents: "none",
        }}
      />
      {/* Dot grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.018,
          backgroundImage: `radial-gradient(circle, #8B00DC 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          textAlign: "center",
          marginBottom: 64,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#7B00CC",
            background: "#f3e8ff",
            border: "1px solid #D8B4FE",
            padding: "5px 18px",
            borderRadius: 100,
            marginBottom: 20,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Expert Guidance
        </div>

        <h2
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            color: "#0D0D0D",
            margin: "0 0 16px",
            letterSpacing: -1,
            lineHeight: 1.1,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Advisory{" "}
          <span
            style={{
              background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Board
          </span>
        </h2>

        <p
          style={{
            fontSize: 15,
            color: "#5A5A72",
            maxWidth: 460,
            margin: "0 auto 28px",
            lineHeight: 1.7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Distinguished experts in healthcare, research, and patient care —
          guiding our mission from the highest levels of experience.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              height: 1.5,
              width: 56,
              background: "linear-gradient(90deg,transparent,#C084FC)",
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#7B00CC",
            }}
          />
          <div
            style={{
              height: 1.5,
              width: 56,
              background: "linear-gradient(90deg,#C084FC,transparent)",
            }}
          />
        </div>
      </motion.div>

      {/* ── Hierarchy ── */}
      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Tier 1 — Chairman */}
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 0 }}
        >
          <div style={{ width: "min(420px, 100%)" }}>
            {tier1.map((a, i) => (
              <AdvisorCard key={a.id} advisor={a} tier={1} index={i} />
            ))}
          </div>
        </div>

        <TierConnector label="Senior Advisors" />

        {/* Tier 2 — Senior Advisors */}
        <div
          className="advisory-tier2"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {tier2.map((a, i) => (
            <AdvisorCard key={a.id} advisor={a} tier={2} index={i} />
          ))}
        </div>

        <TierConnector label="Domain Experts" />

        {/* Tier 3 — Domain Experts */}
        <div
          className="advisory-tier3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {tier3.map((a, i) => (
            <AdvisorCard key={a.id} advisor={a} tier={3} index={i} />
          ))}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .advisory-tier2, .advisory-tier3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 540px) {
          .advisory-tier2, .advisory-tier3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
