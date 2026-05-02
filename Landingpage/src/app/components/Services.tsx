import { motion } from "motion/react";
import {
  Activity,
  Brain,
  PhoneCall,
  Dumbbell,
  Bot,
  HeartPulse,
  Apple,
  Footprints,
  Moon,
  Watch,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "AI Health Coach",
    desc: "24/7 personalized guidance powered by intelligent algorithms that learn your habits and adapt over time.",
    icon: Bot,
    wide: true,
  },
  {
    title: "Health Tracking",
    desc: "Monitor vitals, habits, and progress in real-time.",
    icon: Watch,
    wide: false,
  },
  {
    title: "Mental Health",
    desc: "AI-driven emotional wellness and stress management.",
    icon: Brain,
    wide: false,
  },
  {
    title: "Doctor Consultation",
    desc: "Connect with certified doctors anytime, anywhere.",
    icon: PhoneCall,
    wide: false,
  },
  {
    title: "Daily Exercise",
    desc: "Smart fitness routines tailored to your lifestyle.",
    icon: Activity,
    wide: false,
  },
  {
    title: "Workout Plans",
    desc: "AI-generated plans for every fitness level — from beginner to advanced.",
    icon: Dumbbell,
    wide: true,
  },
  {
    title: "Healthy Nutrition",
    desc: "Personalized diet plans and calorie tracking.",
    icon: Apple,
    wide: false,
  },
  {
    title: "Step Tracking",
    desc: "Track daily activity and improve movement habits.",
    icon: Footprints,
    wide: false,
  },
  {
    title: "Sleep Monitoring",
    desc: "Improve sleep quality with smart AI insights.",
    icon: Moon,
    wide: false,
  },
  {
    title: "Preventive Care",
    desc: "Early detection and risk alerts using AI.",
    icon: ShieldCheck,
    wide: false,
  },
  {
    title: "Clinical Insights",
    desc: "Data-driven reports for better decisions.",
    icon: Stethoscope,
    wide: false,
  },
  {
    title: "Heart Health",
    desc: "Track cardiovascular health and vital signals.",
    icon: HeartPulse,
    wide: false,
  },
];

function FeatureCard({
  item,
  index,
}: {
  item: (typeof features)[0];
  index: number;
}) {
  const Icon = item.icon;
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`wc${item.wide ? " wc--wide" : ""}`}
      style={{
        position: "relative",
        background: "#ffffff",
        border: "1.5px solid #EDE5F8",
        borderRadius: 20,
        padding: item.wide ? "34px 30px" : "26px 22px",
        overflow: "hidden",
        cursor: "default",
        display: "flex",
        flexDirection: item.wide ? "row" : "column",
        alignItems: item.wide ? "center" : "flex-start",
        gap: item.wide ? 28 : 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
        boxShadow: "0 2px 12px rgba(123,0,204,0.05)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="wc-topbar"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg,#7B00CC,#CC00FF)",
          opacity: 0.15,
          transition: "opacity 0.3s",
        }}
      />

      {/* Ambient glow blob */}
      <div
        style={{
          position: "absolute",
          top: item.wide ? "50%" : -20,
          left: item.wide ? "unset" : "unset",
          right: item.wide ? -20 : -20,
          transform: item.wide ? "translateY(-50%)" : "none",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(139,0,220,0.07) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Index number */}
      <span
        style={{
          position: "absolute",
          top: 14,
          right: 18,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: "rgba(139,0,220,0.18)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {num}
      </span>

      {/* Icon box */}
      <div
        style={{
          width: item.wide ? 56 : 46,
          height: item.wide ? 56 : 46,
          borderRadius: 14,
          background: item.wide
            ? "linear-gradient(135deg,#7B00CC,#CC00FF)"
            : "#F3EEFF",
          border: item.wide ? "none" : "1px solid #E8D9FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginBottom: item.wide ? 0 : 18,
          transition: "all 0.3s ease",
          boxShadow: item.wide ? "0 6px 20px rgba(123,0,204,0.3)" : "none",
        }}
        className="wc-icon"
      >
        <Icon
          style={{
            color: item.wide ? "#fff" : "#8B00DC",
            width: item.wide ? 26 : 22,
            height: item.wide ? 26 : 22,
          }}
          strokeWidth={1.6}
        />
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: item.wide ? 20 : 15,
            fontWeight: 800,
            color: "#0D0D0D",
            lineHeight: 1.25,
            marginBottom: 8,
            letterSpacing: item.wide ? -0.5 : -0.1,
          }}
        >
          {item.title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "#6B6B85",
            lineHeight: 1.72,
            fontWeight: 400,
            maxWidth: item.wide ? 400 : "none",
          }}
        >
          {item.desc}
        </p>
      </div>

      {/* Bottom accent line */}
      <div
        className="wc-line"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg,transparent,#8B00DC,transparent)",
          opacity: 0,
          transition: "opacity 0.3s",
        }}
      />
    </motion.div>
  );
}

export function Service() {
  return (
    <section
      id="service"
      style={{
        background: "#FAF7FF",
        padding: "96px 24px 120px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -180,
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
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
      {/* Dot grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.018,
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 56 }}
        >
          {/* Eyebrow badge */}
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
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Platform Features
          </div>

          {/* Title + description split */}
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
                fontSize: "clamp(2.2rem,5vw,3.8rem)",
                fontWeight: 900,
                color: "#0D0D0D",
                lineHeight: 1.08,
                letterSpacing: -1.5,
                margin: 0,
              }}
            >
              Your Smart
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#7B00CC 0%,#CC00FF 60%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Health Advisory
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
              Personalized care powered by AI and expert guidance to improve
              your daily health and wellness.
            </p>
          </div>
        </motion.div>

        {/* ── Bento grid ── */}
        <div className="well-grid">
          {features.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} />
          ))}
        </div>

        {/* ── Tagline ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            textAlign: "center",
            marginTop: 48,
            fontSize: 14,
            color: "#9898A8",
            fontStyle: "italic",
            letterSpacing: 0.3,
          }}
        >
          "Transforming everyday habits into lifelong wellness."
        </motion.p>
      </div>

      <style>{`
        /* ── Card hover ── */
        .wc:hover {
          border-color: rgba(139,0,220,0.5) !important;
          box-shadow: 0 16px 48px rgba(123,0,204,0.13),
                      0 0 0 1px rgba(139,0,220,0.12) !important;
          transform: translateY(-5px) !important;
        }
        .wc:hover .wc-topbar {
          opacity: 1 !important;
        }
        .wc:hover .wc-line {
          opacity: 0.5 !important;
        }
        .wc:hover .wc-icon {
          background: linear-gradient(135deg,#7B00CC,#CC00FF) !important;
          border-color: transparent !important;
          box-shadow: 0 4px 16px rgba(123,0,204,0.28) !important;
        }
        .wc:hover .wc-icon svg {
          color: #fff !important;
        }

        /* ── Grid ── */
        .well-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          align-items: stretch;
        }
        .wc--wide {
          grid-column: span 2;
        }
        @media (max-width: 900px) {
          .well-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .wc--wide {
            grid-column: span 2;
          }
        }
        @media (max-width: 560px) {
          .well-grid {
            grid-template-columns: 1fr;
          }
          .wc--wide {
            grid-column: span 1;
          }
        }
      `}</style>
    </section>
  );
}
