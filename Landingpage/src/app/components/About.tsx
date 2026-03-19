import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "./ui/TiltCard";
import { ParallaxLayer } from "./ui/ParallaxLayer";

const imgDoctorMain = "https://images.unsplash.com/photo-1758691461516-7e716e0ca135?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkb2N0b3IlMjBwb3J0cmFpdCUyMHNtaWxpbmclMjB3aGl0ZSUyMGNvYXR8ZW58MXx8fHwxNzcxOTQ2MTczfDA&ixlib=rb-4.1.0&q=80&w=1080";
const imgExec       = "https://images.unsplash.com/photo-1650784854452-6f18e97221f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwZXhlY3V0aXZlJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE5NDYxNzV8MA&ixlib=rb-4.1.0&q=80&w=1080";

const values = [
  { label: "Patient-First Design", desc: "Every feature built around real patient and provider workflows." },
  { label: "Radical Transparency", desc: "Open, explainable AI — no black boxes in clinical decisions." },
  { label: "Continuous Innovation", desc: "We iterate rapidly with our clinical advisory board at every stage." },
  { label: "Global Reach", desc: "Operating across 40+ jurisdictions with local data sovereignty." },
];

export function About() {
  const go = () => {
    const el = document.querySelector("#contact") as HTMLElement | null;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <section id="about" className="bg-white py-16 sm:py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
              <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">About Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] mb-6 leading-tight">
              Built by Clinicians,<br />Powered by Data.
            </h2>
            <p className="text-[#5A5A72] text-lg leading-relaxed mb-5">
              Datalet was founded with a singular mission — to close the gap between healthcare data and meaningful clinical action.
            </p>
            <p className="text-[#9898A8] text-sm leading-relaxed mb-12">
              Our team of physicians, data scientists, and engineers partners with health systems, payers, and life science companies to turn fragmented data into clear, actionable insights that drive better patient outcomes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {values.map((v, i) => (
                <TiltCard
                  key={v.label}
                  intensity={6}
                  glowColor="rgba(139,0,220,0.09)"
                  className="bg-[#FAF7FF] border border-[#E8E0F5] rounded-2xl p-4 sm:p-6 cursor-default"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      className="h-0.5 rounded mb-3"
                      style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }}
                      initial={{ width: "1.5rem" }}
                      whileHover={{ width: "3rem" }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="font-semibold text-[#0D0D0D] text-sm mb-1.5">{v.label}</div>
                    <div className="text-[#9898A8] text-xs leading-relaxed">{v.desc}</div>
                  </motion.div>
                </TiltCard>
              ))}
            </div>

            <motion.button
              initial={{ color: "#8B00DC" }}
              whileHover={{ x: 5, color: "#AA00FF" }}
              transition={{ type: "spring", stiffness: 280 }}
              onClick={go}
              className="group flex items-center gap-2 text-sm font-semibold cursor-pointer"
            >
              Get in touch
              <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Right — doctor photo with parallax layers */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-15 blur-[80px] pointer-events-none"
              style={{ background: "radial-gradient(circle, #AA00FF, transparent 70%)" }} />

            {/* Main photo — slow parallax */}
            <ParallaxLayer speed={-0.1} className="relative">
              <TiltCard
                intensity={6}
                glowColor="rgba(139,0,220,0.10)"
                className="relative rounded-3xl overflow-hidden border border-[#E8E0F5] shadow-2xl shadow-[#8B00DC]/10 group"
                style={{ aspectRatio: "4/5" }}
              >
                <motion.img
                  src={imgDoctorMain}
                  alt="Datalet clinical leadership"
                  className="w-full h-full object-cover object-top"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0030]/30 to-transparent pointer-events-none" />
              </TiltCard>
            </ParallaxLayer>

            {/* Floating year badge — faster parallax (pops forward) */}
            <div className="absolute top-4 right-4 sm:-top-6 sm:-right-6 z-20">
              <ParallaxLayer speed={0.15}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, scale: 1.06, boxShadow: "0 20px 50px rgba(139,0,220,0.35)" }}
                  className="rounded-2xl px-7 py-5 shadow-2xl shadow-[#8B00DC]/25 cursor-default"
                  style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
                >
                  <div className="text-white font-black text-4xl leading-none">12+</div>
                  <div className="text-white/70 text-xs font-medium mt-1">Years of Impact</div>
                </motion.div>
              </ParallaxLayer>
            </div>

            {/* Floating clinician chip — medium parallax */}
            <div className="absolute bottom-4 left-4 sm:-bottom-6 sm:-left-6 z-20">
              <ParallaxLayer speed={0.08}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(139,0,220,0.14)" }}
                  className="bg-white border border-[#E8E0F5] rounded-2xl overflow-hidden shadow-xl flex items-stretch cursor-default"
                  style={{ height: 76 }}
                >
                  <div className="w-16 overflow-hidden shrink-0">
                    <img src={imgExec} alt="Healthcare executive" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="px-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-0.5">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-[#8B00DC]"
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-[#9898A8] text-xs">KLAS Research</span>
                    </div>
                    <div className="text-[#0D0D0D] text-sm font-bold">Top-Rated Platform</div>
                  </div>
                </motion.div>
              </ParallaxLayer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}