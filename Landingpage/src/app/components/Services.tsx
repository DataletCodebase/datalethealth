import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import { TiltCard } from "./ui/TiltCard";
import { ParallaxLayer } from "./ui/ParallaxLayer";
import { WellnessWidgetDashboard } from "./WellnessWidgets";

// Replaced nurse image → health data analytics dashboard
const imgDoctorTablet = "https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgMedTeam      = "https://images.unsplash.com/photo-1770221797869-81e508282ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgDataViz      = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

const bridgePoints = [
  { label: "Increasing Talent",       sub: "AI reduces administrative load" },
  { label: "Lowering Friction",       sub: "Seamless workflow integration" },
  { label: "Enhancing Pharma Insight", sub: "Real-world evidence platform" },
];

// ── 3-D photo card with tilt + parallax inner zoom ───────────────────────────
function PhotoCard({
  src, alt, badge, badgeLabel, badgeSub, tall = false, delay = 0,
}: {
  src: string; alt: string; badge?: boolean; badgeLabel?: string;
  badgeSub?: string; tall?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={tall ? "row-span-2" : ""}
    >
      <TiltCard
        intensity={8}
        glowColor="rgba(139,0,220,0.14)"
        className={`relative rounded-3xl overflow-hidden border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.07] group ${tall ? "h-full" : ""}`}
        style={{ aspectRatio: tall ? "3/5" : "1" }}
      >
        {/* Image with inner parallax on hover */}
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0030]/65 via-[#1a0030]/10 to-transparent" />

        {badge && (
          <motion.div
            className="absolute bottom-4 left-4 right-4"
            initial={{ y: 8, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
          >
            <div className="bg-white/90 backdrop-blur-md border border-[#8B00DC]/15 rounded-2xl px-4 py-3 shadow-lg">
              <motion.div
                className="font-bold text-sm"
                style={{ color: "#8B00DC" }}
                whileHover={{ letterSpacing: "0.03em" }}
                transition={{ duration: 0.2 }}
              >
                {badgeLabel}
              </motion.div>
              {badgeSub && <div className="text-[#9898A8] text-xs mt-0.5">{badgeSub}</div>}
            </div>
          </motion.div>
        )}

        {/* Corner accent that appears on hover */}
        <motion.div
          className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7B00CC, #CC00FF)" }}
          initial={{ opacity: 0, scale: 0.5 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </motion.div>
      </TiltCard>
    </motion.div>
  );
}

export function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const go = () => {
    const el = document.querySelector("#contact") as HTMLElement | null;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orbY = useSpring(useTransform(scrollYProgress, [0, 1], [-60, 60]), { damping: 30, stiffness: 100 });

  return (
    <section id="solutions" ref={sectionRef} className="bg-white py-20 lg:py-36 relative overflow-hidden">
      {/* Parallax background orb */}
      <motion.div
        style={{ y: orbY }}
        className="absolute top-1/2 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none"
        aria-hidden
      >
        <div className="w-full h-full rounded-full" style={{ background: "radial-gradient(circle, #AA00FF, transparent 70%)" }} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="h-0.5 rounded"
              style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }}
              initial={{ width: 0 }}
              whileInView={{ width: 24 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">Our Solutions</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] max-w-lg leading-tight">
              Clinical Solutions<br />That Scale
            </h2>
            <p className="text-[#5A5A72] text-sm max-w-xs leading-relaxed lg:pb-2">
              Real-time patient intelligence powering smarter care decisions at population scale.
            </p>
          </div>
        </motion.div>

        {/* ── Wellness Widget Dashboard replaces old service cards ── */}
        <WellnessWidgetDashboard />

        {/* Bridge section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-20 border-t border-[#8B00DC]/[0.08]">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
              <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">How We Help</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0D0D0D] mb-14 leading-tight">
              Datalet bridges<br />this gap by:
            </h3>
            <div className="space-y-7">
              {bridgePoints.map((pt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-5 group/item"
                >
                  <motion.div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-[#8B00DC]/15"
                    style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
                    whileHover={{ scale: 1.15, rotate: 8, boxShadow: "0 12px 32px rgba(139,0,220,0.30)" }}
                    transition={{ type: "spring", stiffness: 280 }}
                  >
                    <span className="text-white font-bold text-sm">0{i + 1}</span>
                  </motion.div>
                  <div>
                    <div className="font-semibold text-[#0D0D0D] group-hover/item:text-[#8B00DC] transition-colors mb-0.5">{pt.label}</div>
                    <div className="text-[#9898A8] text-sm">{pt.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right photo grid */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl -z-10"
              style={{ background: "radial-gradient(circle, #AA00FF, transparent 70%)" }} />

            {/* Mobile: single column stack */}
            <div className="flex flex-col gap-4 md:hidden">
              <PhotoCard
                src={imgDoctorTablet}
                alt="Doctor reviewing health data"
                badge badgeLabel="AI Health Coach" badgeSub="24/7 Clinical Support"
                delay={0}
              />
              <PhotoCard src={imgMedTeam} alt="Medical team collaboration" delay={0.1} />
              <PhotoCard
                src={imgDataViz}
                alt="Health data analytics dashboard"
                badge badgeLabel="Live Analytics" badgeSub="Real-time insights"
                delay={0.2}
              />
            </div>

            {/* Desktop: 2-column grid with row-span */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              <ParallaxLayer speed={-0.12} className="row-span-2">
                <PhotoCard
                  src={imgDoctorTablet}
                  alt="Doctor reviewing health data"
                  badge badgeLabel="AI Health Coach" badgeSub="24/7 Clinical Support"
                  tall delay={0}
                />
              </ParallaxLayer>
              <ParallaxLayer speed={0.08}>
                <PhotoCard src={imgMedTeam} alt="Medical team collaboration" delay={0.1} />
              </ParallaxLayer>
              <ParallaxLayer speed={0.18}>
                <PhotoCard
                  src={imgDataViz}
                  alt="Health data analytics dashboard"
                  badge badgeLabel="Live Analytics" badgeSub="Real-time insights"
                  delay={0.2}
                />
              </ParallaxLayer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}