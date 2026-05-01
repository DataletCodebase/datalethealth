import { useState } from "react";
import { motion } from "framer-motion";

const advisors = [
  {
    id: 1,
    name: "Prahlada Rama Rao",
    role: "Chairman, Advisory Board",
    title: "Former Director, DRDL (DRDO)",
    desc: "Renowned aerospace engineer known for contributions to India's space and defence programs. Awarded Padma Shri (2015).",
    icon: "🏛️",
  },
  {
    id: 2,
    name: "Dr. Ranjib Ghosh",
    role: "Professor & HOD, Pharmacology",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Leading pharmacologist driving evidence-based therapeutic research and clinical education.",
    icon: "🔬",
  },
  {
    id: 3,
    name: "Dr. A. K. Chakma",
    role: "HOD, Ophthalmology",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Renowned ophthalmologist with decades of clinical excellence in eye care and surgical innovation.",
    icon: "👁️",
  },
  {
    id: 4,
    name: "Dr. Rajib Debnath",
    role: "HOD, Orthopedic Department",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Expert orthopaedic surgeon specialising in joint reconstruction and musculoskeletal health outcomes.",
    icon: "🦴",
  },
  {
    id: 5,
    name: "Dr. Santanu Ghosh",
    role: "Associate Professor, Psychiatry",
    title: "TMC & Dr. BRAM Teaching Hospital",
    desc: "Mental health specialist integrating clinical psychiatry with patient-centred digital care pathways.",
    icon: "🧠",
  },
  {
    id: 6,
    name: "Ms. Anmayee Nanda",
    role: "Senior Dietitian",
    title: "Hi-Tech Medical College · Former Apollo & Sunshine",
    desc: "Certified clinical dietitian with expertise in therapeutic nutrition and preventive wellness programs.",
    icon: "🥗",
  },
  {
    id: 7,
    name: "Mr. Niloy Dey",
    role: "Certified Nutritionist & Trainer",
    title: "Owner, Gladiator Fitness",
    desc: "Performance nutrition and fitness expert empowering individuals through science-backed training methodologies.",
    icon: "💪",
  },
];

interface Advisor {
  id: number;
  name: string;
  role: string;
  title: string;
  desc: string;
  icon: string;
}

function AdvisorCard({ advisor, index }: { advisor: Advisor; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.06,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "28px 24px 26px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        border: hovered ? "1.5px solid #8B00DC" : "1.5px solid #EDE5F8",
        boxShadow: hovered
          ? "0 16px 48px rgba(123,0,204,0.13), 0 2px 12px rgba(0,0,0,0.05)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        cursor: "default",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        height: "100%",
        boxSizing: "border-box" as const,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg,#7B00CC,#CC00FF)",
          opacity: hovered ? 1 : 0.2,
          transition: "opacity 0.3s",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: hovered
            ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
            : "#F3EEFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          marginBottom: 18,
          flexShrink: 0,
          transition: "all 0.3s ease",
          boxShadow: hovered ? "0 4px 16px rgba(123,0,204,0.22)" : "none",
        }}
      >
        {advisor.icon}
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#0D0D0D",
          lineHeight: 1.25,
          marginBottom: 6,
          letterSpacing: -0.2,
        }}
      >
        {advisor.name}
      </h3>

      {/* Role */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#7B00CC",
          marginBottom: 4,
          letterSpacing: 0.1,
          lineHeight: 1.4,
        }}
      >
        {advisor.role}
      </p>

      {/* Institution */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#AEAEBF",
          marginBottom: 16,
          lineHeight: 1.4,
        }}
      >
        {advisor.title}
      </p>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: hovered
            ? "linear-gradient(90deg,#C084FC,transparent)"
            : "#F0EAFF",
          marginBottom: 14,
          transition: "background 0.3s",
        }}
      />

      {/* Description */}
      <p
        style={{
          fontSize: 12.5,
          color: "#6B6B85",
          lineHeight: 1.7,
          flexGrow: 1,
          fontWeight: 400,
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
          opacity: hovered ? 0.4 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </motion.div>
  );
}

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
          opacity: 0.4,
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
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.018,
          backgroundImage:
            "radial-gradient(circle,#8B00DC 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          textAlign: "center",
          marginBottom: 60,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#7B00CC",
            background: "#f3e8ff",
            border: "1px solid #D8B4FE",
            padding: "5px 16px",
            borderRadius: 100,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
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
            fontWeight: 400,
          }}
        >
          Distinguished experts in healthcare, research, and patient care —
          guiding our mission with decades of experience.
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

      {/* ── Grid ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="advisory-grid">
          {advisors.map((a, i) => (
            <AdvisorCard key={a.id} advisor={a} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        .advisory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          align-items: stretch;
        }
        @media (max-width: 1024px) {
          .advisory-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 700px) {
          .advisory-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 420px) {
          .advisory-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
