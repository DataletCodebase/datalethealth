import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  ExternalLink,
  BookOpen,
  FlaskConical,
  Award,
  Zap,
} from "lucide-react";

/* ── Data ────────────────────────────────────────────────────── */
const publicationData = [
  {
    id: 1,
    title:
      "AI-Driven Cardiometabolic Risk Prediction Using Wearable Biosensors",
    category: "Publication",
    date: "Apr 15, 2026",
    tag: "Cardiology",
    desc: "A clinical study on using real-time biosensor data and machine learning to predict cardiometabolic disorders with 94% accuracy across 2,400 patients.",
    authors: "Dr. R. K. Verma, Dr. J. L. Sarkar et al.",
    icon: BookOpen,
  },
  {
    id: 2,
    title:
      "InfectiScan: Rapid ICU Infection Detection via Multi-Sensor AI Fusion",
    category: "Research",
    date: "Mar 28, 2026",
    tag: "Diagnostics",
    desc: "Evaluation of InfectiScan's biosensor array and deep learning pipeline for early-stage infection identification in critical care environments.",
    authors: "Datalet Research Team",
    icon: FlaskConical,
  },
  {
    id: 3,
    title: "Personalised Nutrition Modeling for Type 2 Diabetes Management",
    category: "Publication",
    date: "Mar 10, 2026",
    tag: "Nutrition",
    desc: "Longitudinal analysis of AI-tailored dietary plans and glycaemic response tracking in 1,800 diabetic patients across three hospitals.",
    authors: "Ms. A. Nanda, Dr. R. Ghosh et al.",
    icon: BookOpen,
  },
  {
    id: 4,
    title:
      "MetaCast V1.0: Adverse Drug Reaction Forecasting via Molecular Graph Neural Networks",
    category: "Milestone",
    date: "Feb 20, 2026",
    tag: "Pharmacology",
    desc: "Introduction of MetaCast's GNN architecture for ADR prediction, achieving 91% precision on a dataset of 320,000 molecular interaction records.",
    authors: "Dr. R. Debnath, Datalet AI Lab",
    icon: Award,
  },
  {
    id: 5,
    title:
      "Mental Health Pattern Detection Using Multimodal Behavioural Signals",
    category: "Research",
    date: "Feb 5, 2026",
    tag: "Mental Health",
    desc: "A framework combining voice analysis, sleep patterns, and activity data to detect early indicators of anxiety and depression with 88% sensitivity.",
    authors: "Dr. S. Ghosh et al.",
    icon: FlaskConical,
  },
  {
    id: 6,
    title: "Portable AI Ophthalmoscopy for Rural Eye Disease Screening",
    category: "Publication",
    date: "Jan 18, 2026",
    tag: "Ophthalmology",
    desc: "Deployment of handheld AI-based eye diagnostic tools across 12 rural districts, screening over 40,000 patients for glaucoma and diabetic retinopathy.",
    authors: "Dr. A. K. Chakma, Datalet Research",
    icon: BookOpen,
  },
  {
    id: 7,
    title:
      "Datalet Health Platform: Clinical Validation Study — Phase II Results",
    category: "Milestone",
    date: "Jan 5, 2026",
    tag: "Platform",
    desc: "Phase II validation of the Datalet Health platform across 6 hospitals, demonstrating 37% reduction in preventable hospital readmissions.",
    authors: "Subhashish D. M., Pritish K. Ray et al.",
    icon: Award,
  },
  {
    id: 8,
    title:
      "Speech & Hearing Disorder Classification with Transformer-Based Audio Models",
    category: "Release",
    date: "Dec 12, 2025",
    tag: "Neurology",
    desc: "Release of an open benchmark and transformer model for classifying 14 categories of speech and hearing disorders from short audio samples.",
    authors: "Datalet AI Lab",
    icon: Zap,
  },
];

const categories = ["All", "Publication", "Research", "Milestone", "Release"];

const categoryColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Publication: { bg: "#EDE5FF", text: "#7B00CC", border: "#D8B4FE" },
  Research: { bg: "#E0F0FF", text: "#0066CC", border: "#BAD7FF" },
  Milestone: { bg: "#FFF0E0", text: "#B85C00", border: "#FFD7A8" },
  Release: { bg: "#E2FFF0", text: "#007A44", border: "#A8FFCD" },
};

/* ── Card Components ─────────────────────────────────────────── */
function GridCard({
  pub,
  index,
}: {
  pub: (typeof publicationData)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = categoryColors[pub.category];
  const PubIcon = pub.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 18,
        padding: "26px 24px 22px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        border: hovered ? "1.5px solid #8B00DC" : "1.5px solid #EDE5F8",
        boxShadow: hovered
          ? "0 18px 52px rgba(123,0,204,0.13), 0 2px 12px rgba(0,0,0,0.05)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.32s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        height: "100%",
        boxSizing: "border-box" as const,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg,#7B00CC,#CC00FF)",
          opacity: hovered ? 1 : 0.18,
          transition: "opacity 0.3s",
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {/* Category badge */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: colors.text,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            padding: "3px 10px",
            borderRadius: 100,
            flexShrink: 0,
          }}
        >
          {pub.category}
        </span>

        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: hovered
              ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
              : "#F3EEFF",
            border: hovered ? "none" : "1px solid #E8D9FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s",
          }}
        >
          <PubIcon
            size={16}
            style={{
              color: hovered ? "#fff" : "#8B00DC",
              transition: "color 0.3s",
            }}
            strokeWidth={1.7}
          />
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#0D0D0D",
          lineHeight: 1.3,
          marginBottom: 10,
          letterSpacing: -0.2,
          flexGrow: 0,
        }}
      >
        {pub.title}
      </h3>

      {/* Tag + date row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#7B00CC",
            background: "#f3e8ff",
            padding: "2px 8px",
            borderRadius: 100,
            border: "1px solid #E8D9FF",
          }}
        >
          {pub.tag}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "#AEAEBF",
            fontWeight: 500,
          }}
        >
          <Calendar size={10} /> {pub.date}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 12.5,
          color: "#6B6B85",
          lineHeight: 1.7,
          marginBottom: 16,
          flexGrow: 1,
          fontWeight: 400,
        }}
      >
        {pub.desc}
      </p>

      {/* Authors */}
      <p
        style={{
          fontSize: 11,
          color: "#AEAEBF",
          marginBottom: 16,
          fontWeight: 500,
          fontStyle: "italic",
        }}
      >
        {pub.authors}
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

      {/* Read more */}
      <a
        href="#"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          color: "#7B00CC",
          textDecoration: "none",
        }}
      >
        Read Paper <ArrowRight size={13} />
      </a>

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg,transparent,#8B00DC,transparent)",
          opacity: hovered ? 0.45 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </motion.article>
  );
}

function ListRow({
  pub,
  index,
}: {
  pub: (typeof publicationData)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = categoryColors[pub.category];
  const PubIcon = pub.icon;

  return (
    <motion.article
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{
        delay: index * 0.05,
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        border: hovered ? "1.5px solid #8B00DC" : "1.5px solid #EDE5F8",
        boxShadow: hovered
          ? "0 12px 36px rgba(123,0,204,0.11)"
          : "0 2px 10px rgba(0,0,0,0.04)",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 3,
          background: "linear-gradient(to bottom,#7B00CC,#CC00FF)",
          opacity: hovered ? 1 : 0.2,
          transition: "opacity 0.3s",
          borderRadius: "3px 0 0 3px",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: hovered
            ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
            : "#F3EEFF",
          border: hovered ? "none" : "1px solid #E8D9FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.3s",
        }}
      >
        <PubIcon
          size={18}
          style={{
            color: hovered ? "#fff" : "#8B00DC",
            transition: "color 0.3s",
          }}
          strokeWidth={1.6}
        />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: colors.text,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              padding: "2px 8px",
              borderRadius: 100,
            }}
          >
            {pub.category}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#7B00CC",
              background: "#f3e8ff",
              padding: "2px 7px",
              borderRadius: 100,
              border: "1px solid #E8D9FF",
            }}
          >
            {pub.tag}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              color: "#AEAEBF",
            }}
          >
            <Calendar size={10} /> {pub.date}
          </span>
        </div>

        <h3
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#0D0D0D",
            lineHeight: 1.3,
            marginBottom: 4,
            letterSpacing: -0.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pub.title}
        </h3>

        <p
          style={{
            fontSize: 12,
            color: "#6B6B85",
            lineHeight: 1.5,
            fontWeight: 400,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {pub.desc}
        </p>
      </div>

      {/* Right arrow */}
      <a
        href="#"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 10,
          background: hovered
            ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
            : "#F3EEFF",
          border: hovered ? "none" : "1px solid #E8D9FF",
          flexShrink: 0,
          transition: "all 0.3s",
          textDecoration: "none",
        }}
      >
        <ExternalLink
          size={14}
          style={{
            color: hovered ? "#fff" : "#8B00DC",
            transition: "color 0.3s",
          }}
        />
      </a>
    </motion.article>
  );
}

/* ── Main Export ─────────────────────────────────────────────── */
export const Publications = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Newest");

  const filtered = publicationData.filter(
    (p) => activeCategory === "All" || p.category === activeCategory,
  );

  return (
    <section
      id="publications"
      style={{
        background: "#FAF7FF",
        padding: "90px 24px 120px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 520,
          height: 520,
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
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle,#DDD6FE 0%,transparent 65%)",
          opacity: 0.28,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.016,
          backgroundImage:
            "radial-gradient(circle,#8B00DC 1px,transparent 1px)",
          backgroundSize: "38px 38px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 52 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              color: "#7B00CC",
              background: "#f3e8ff",
              border: "1px solid #D8B4FE",
              padding: "5px 16px",
              borderRadius: 100,
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
                display: "inline-block",
              }}
            />
            Datalet Research
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2rem,5vw,3.2rem)",
                fontWeight: 900,
                color: "#0D0D0D",
                lineHeight: 1.08,
                letterSpacing: -1,
                margin: 0,
              }}
            >
              Our Latest{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Publications
              </span>
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#5A5A72",
                maxWidth: 320,
                lineHeight: 1.78,
                fontWeight: 400,
                margin: 0,
              }}
            >
              Peer-reviewed research, clinical studies, and milestone releases
              from the Datalet AI Health team.
            </p>
          </div>
        </motion.div>

        {/* ── Filter + Controls bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.45 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          {/* Category tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1.5px solid #EDE5F8",
              borderRadius: 100,
              padding: "5px 6px",
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: 100,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.22s ease",
                  background:
                    activeCategory === cat
                      ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
                      : "transparent",
                  color: activeCategory === cat ? "#fff" : "#6B6B85",
                  boxShadow:
                    activeCategory === cat
                      ? "0 4px 14px rgba(123,0,204,0.3)"
                      : "none",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Filter chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#6B6B85",
                background: "#fff",
                border: "1.5px solid #EDE5F8",
                padding: "7px 14px",
                borderRadius: 100,
                cursor: "pointer",
              }}
            >
              <Filter size={13} /> Filter
            </div>

            {/* Sort dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setSortOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B6B85",
                  background: "#fff",
                  border: "1.5px solid #EDE5F8",
                  padding: "7px 14px",
                  borderRadius: 100,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Sort: {sortBy} <ChevronDown size={13} />
              </button>
              {sortOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "#fff",
                    border: "1.5px solid #EDE5F8",
                    borderRadius: 12,
                    padding: "6px",
                    zIndex: 10,
                    minWidth: 140,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                >
                  {["Newest", "Oldest", "A–Z"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setSortOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: sortBy === opt ? "#7B00CC" : "#6B6B85",
                        background: sortBy === opt ? "#f3e8ff" : "transparent",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <div
              style={{
                display: "flex",
                background: "#fff",
                border: "1.5px solid #EDE5F8",
                borderRadius: 100,
                overflow: "hidden",
                padding: "4px",
                gap: 2,
              }}
            >
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 100,
                    border: "none",
                    cursor: "pointer",
                    background:
                      viewMode === mode
                        ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
                        : "transparent",
                    color: viewMode === mode ? "#fff" : "#9898A8",
                    transition: "all 0.22s ease",
                  }}
                >
                  {mode === "grid" ? (
                    <LayoutGrid size={14} />
                  ) : (
                    <List size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Publication items ── */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: 16,
                alignItems: "stretch",
              }}
            >
              {filtered.map((pub, i) => (
                <GridCard key={pub.id} pub={pub} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {filtered.map((pub, i) => (
                <ListRow key={pub.id} pub={pub} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ textAlign: "center", marginTop: 52 }}
        >
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
              padding: "14px 32px",
              borderRadius: 100,
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(123,0,204,0.3)",
              transition: "all 0.25s ease",
              letterSpacing: 0.2,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-3px)";
              el.style.boxShadow = "0 14px 36px rgba(123,0,204,0.4)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "0 8px 28px rgba(123,0,204,0.3)";
            }}
          >
            View All Publications <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Publications;
