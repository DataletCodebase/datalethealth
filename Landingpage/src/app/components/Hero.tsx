// import { ArrowRight, Play } from "lucide-react";
// import { motion, useScroll, useTransform, useSpring } from "motion/react";
// import { useRef } from "react";
// import { HealthDashboardWidget } from "./HealthWidgets";
// import { MagneticButton } from "./ui/MagneticButton";
// import { ParallaxLayer } from "./ui/ParallaxLayer";

// export function Hero() {
//   const go = (h: string) => {
//     const el = document.querySelector(h) as HTMLElement | null;
//     if (!el) return;
//     window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
//   };
//   const sectionRef = useRef<HTMLDivElement>(null);

//   // Scroll-driven parallax for the right widget panel
//   const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
//   const widgetY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 80]), { damping: 28, stiffness: 90 });
//   const copyY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 40]), { damping: 28, stiffness: 90 });
//   const orbY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 120]), { damping: 20, stiffness: 60 });

//   return (
//     <section id="hero" ref={sectionRef} className="relative min-h-screen bg-white flex flex-col overflow-hidden">
//       {/* Soft purple gradient orbs — parallax on scroll */}
//       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
//         <motion.div
//           style={{ y: orbY, background: "radial-gradient(circle, #AA00FF 0%, transparent 65%)" }}
//           animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.12, 0.07] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//           className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.06, 1], opacity: [0.05, 0.09, 0.05] }}
//           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//           className="absolute top-1/3 -right-60 w-[700px] h-[700px] rounded-full"
//           style={{ background: "radial-gradient(circle, #7B00CC 0%, transparent 65%)" }}
//         />
//         <div className="absolute inset-0 opacity-[0.018]"
//           style={{ backgroundImage: `radial-gradient(circle, #8B00DC 1px, transparent 1px)`, backgroundSize: "44px 44px" }}
//         />
//       </div>

//       <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20 w-full">
//         <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center w-full">

//           {/* ——— Left copy — slower parallax ——— */}
//           <motion.div style={{ y: copyY }}>
//             <motion.div
//               variants={{ container: { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } } }}
//               initial="initial" animate="animate"
//             >
//               <motion.div
//                 initial={{ opacity: 0, y: 22 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
//                 className="flex flex-wrap gap-2 mb-12"
//               >
//                 {["AI-Powered Analytics", "HIPAA Compliant", "500+ Health Systems", "Real-time Insights"].map((p) => (
//                   <motion.span
//                     key={p}
//                     whileHover={{ scale: 1.07, y: -2, borderColor: "rgba(139,0,220,0.35)", backgroundColor: "rgba(139,0,220,0.07)" }}
//                     transition={{ type: "spring", stiffness: 320 }}
//                     className="px-3.5 py-1.5 text-xs text-[#8B00DC] border rounded-full font-medium cursor-default"
//                     style={{ borderColor: "rgba(139,0,220,0.20)", backgroundColor: "rgba(139,0,220,0.04)" }}
//                   >
//                     {p}
//                   </motion.span>
//                 ))}
//               </motion.div>

//               <motion.h1
//                 initial={{ opacity: 0, y: 22 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
//                 className="text-[2.2rem] sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#0D0D0D] leading-[0.95] tracking-tight mb-8"
//               >
//                 Your Health,
//                 <br />
//                 <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)", backgroundClip: "text" }}>
//                   Your Control!
//                 </span>
//               </motion.h1>

//               <motion.p
//                 initial={{ opacity: 0, y: 22 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
//                 className="text-[#5A5A72] text-lg leading-relaxed max-w-md mb-12"
//               >
//                 Datalet Healthcare delivers personalised insights across medicines, nutrition, genetics
//                 through our data platform — empowering providers and patients to make smarter health decisions.
//               </motion.p>

//               <motion.div
//                 initial={{ opacity: 0, y: 22 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
//                 className="flex flex-col sm:flex-row flex-wrap gap-3 mb-16"
//               >
//                 {/* Magnetic primary CTA */}
//                 <MagneticButton
//                   strength={12}
//                   onClick={() => window.location.href = "/app/"}
//                   className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 text-sm text-white font-semibold rounded-2xl shadow-xl shadow-[#8B00DC]/25"
//                   style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
//                 >
//                   Get Started Today
//                   <motion.span
//                     className="inline-flex"
//                     animate={{ x: [0, 3, 0] }}
//                     transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
//                   >
//                     <ArrowRight className="w-4 h-4" />
//                   </motion.span>
//                 </MagneticButton>

//                 <MagneticButton
//                   strength={10}
//                   onClick={() => go("#how-it-works")}
//                   className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 text-sm text-[#5A5A72] hover:text-[#8B00DC] rounded-2xl border border-[#E8E0F5] bg-white shadow-sm transition-colors"
//                 >
//                   <motion.div
//                     className="w-7 h-7 rounded-full flex items-center justify-center"
//                     style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
//                     whileHover={{ scale: 1.2, rotate: 15 }}
//                     transition={{ type: "spring", stiffness: 300 }}
//                   >
//                     <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
//                   </motion.div>
//                   Watch Demo
//                 </MagneticButton>
//               </motion.div>

//               {/* Trust row */}
//               <motion.div
//                 initial={{ opacity: 0, y: 22 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
//                 className="flex items-center gap-5 pt-8 border-t border-[#8B00DC]/10"
//               >
//                 <div className="flex items-center -space-x-3">
//                   {[
//                     "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
//                     "https://images.unsplash.com/photo-1659353887019-b142198f2668?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
//                     "https://images.unsplash.com/photo-1645066928295-2506defde470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
//                   ].map((src, i) => (
//                     <motion.div
//                       key={i}
//                       whileHover={{ scale: 1.2, y: -4, zIndex: 20 }}
//                       transition={{ type: "spring", stiffness: 320 }}
//                       className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-sm cursor-pointer"
//                       style={{ zIndex: 10 - i }}
//                     >
//                       <img src={src} alt="clinician" className="w-full h-full object-cover object-top" />
//                     </motion.div>
//                   ))}
//                   <div
//                     className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
//                     style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)", zIndex: 7 }}
//                   >+</div>
//                 </div>
//                 <div>
//                   <div className="text-[#0D0D0D] text-sm font-semibold">500+ health systems</div>
//                   <div className="text-[#9898A8] text-xs">already using Datalet</div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           </motion.div>

//           {/* ——— Right — widget with faster parallax ——— */}
//           <motion.div style={{ y: widgetY }} className="relative flex justify-center lg:justify-end">
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-15 blur-[100px] pointer-events-none"
//               style={{ background: "radial-gradient(circle, #AA00FF, transparent 70%)" }} />

//             <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
//                 className="absolute -inset-8 rounded-full border border-dashed border-[#8B00DC]/10 pointer-events-none"
//               />

//               <HealthDashboardWidget />

//               {/* Floating chips */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8, x: 10 }}
//                 animate={{ opacity: 1, scale: 1, x: 0 }}
//                 transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
//                 whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(139,0,220,0.18)" }}
//                 className="absolute -top-5 -right-3 sm:-right-7 bg-white border border-[#E8E0F5] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl shadow-[#8B00DC]/10 cursor-default"
//               >
//                 <div className="font-black text-2xl leading-none" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC, #CC00FF)", backgroundClip: "text" }}>3.2M</div>
//                 <div className="text-[#9898A8] text-xs mt-1">Records / day</div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8, x: -10 }}
//                 animate={{ opacity: 1, scale: 1, x: 0 }}
//                 transition={{ delay: 1.0, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
//                 whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(170,0,255,0.18)" }}
//                 className="absolute -bottom-5 -left-3 sm:-left-7 bg-white border border-[#E8E0F5] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl shadow-[#8B00DC]/10 cursor-default"
//               >
//                 <div className="text-[#AA00FF] font-black text-2xl leading-none">98%</div>
//                 <div className="text-[#9898A8] text-xs mt-1">Patient Satisfaction</div>
//               </motion.div>
//             </div>
//           </motion.div>

//         </div>
//       </div>

//       {/* Scroll hint */}
//       <div className="relative z-10 flex justify-center pb-10">
//         <motion.div
//           animate={{ y: [0, 6, 0] }}
//           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//           className="flex flex-col items-center gap-2 text-[#9898A8] text-xs"
//         >
//           <div className="w-5 h-8 rounded-full border border-[#8B00DC]/20 flex justify-center pt-1.5">
//             <div className="w-0.5 h-2 rounded-full" style={{ background: "linear-gradient(to bottom, #7B00CC, #CC00FF)" }} />
//           </div>
//           scroll
//         </motion.div>
//       </div>
//     </section>
//   );
// }

import { ArrowRight, Play } from "lucide-react";
// import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { HealthDashboardWidget } from "./HealthWidgets";
import { MagneticButton } from "./ui/MagneticButton";
import { ParallaxLayer } from "./ui/ParallaxLayer";
import doctor1 from "../../assets/images/doctor1.avif";
import doctor2 from "../../assets/images/doctor2.avif";
import doctor3 from "../../assets/images/doctor3.avif";

export function Hero() {
  const go = (h: string) => {
    const el = document.querySelector(h) as HTMLElement | null;
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 80,
      behavior: "smooth",
    });
  };
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll-driven parallax for the right widget panel
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const widgetY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 80]), {
    damping: 28,
    stiffness: 90,
  });
  const copyY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 40]), {
    damping: 28,
    stiffness: 90,
  });
  const orbY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 120]), {
    damping: 20,
    stiffness: 60,
  });

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen bg-white flex flex-col overflow-hidden"
    >
      {/* Soft purple gradient orbs — parallax on scroll */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          style={{
            y: orbY,
            background: "radial-gradient(circle, #AA00FF 0%, transparent 65%)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.12, 0.07] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.05, 0.09, 0.05] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/3 -right-60 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, #7B00CC 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `radial-gradient(circle, #8B00DC 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center w-full">
          {/* ——— Left copy — slower parallax ——— */}
          <motion.div style={{ y: copyY }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.15,
                  },
                },
              }}
            >
              {/* Children elements with their own animations */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap gap-2 mb-12"
              >
                {[
                  "AI-Powered Analytics",
                  "HIPAA Compliant",
                  "10+ Health Systems",
                  "Real-time Insights",
                ].map((p) => (
                  <motion.span
                    key={p}
                    whileHover={{
                      scale: 1.07,
                      y: -2,
                      borderColor: "rgba(139,0,220,0.35)",
                      backgroundColor: "rgba(139,0,220,0.07)",
                    }}
                    transition={{ type: "spring", stiffness: 320 }}
                    className="px-3.5 py-1.5 text-xs text-[#8B00DC] border rounded-full font-medium cursor-default"
                    style={{
                      borderColor: "rgba(139,0,220,0.20)",
                      backgroundColor: "rgba(139,0,220,0.04)",
                    }}
                  >
                    {p}
                  </motion.span>
                ))}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[2.2rem] sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#0D0D0D] leading-[0.95] tracking-tight mb-8"
              >
                Your Health,
                <br />
                <span
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundImage:
                      "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)",
                    backgroundClip: "text",
                  }}
                >
                  Your Control!
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[#5A5A72] text-lg leading-relaxed max-w-md mb-12"
              >
                Datalet Healthcare delivers personalised insights across
                medicines, nutrition, genetics through our data platform —
                empowering providers and patients to make smarter health
                decisions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 mb-16"
              >
                {/* Magnetic primary CTA */}
                <MagneticButton
                  strength={12}
                  onClick={() => (window.location.href = "/app/")}
                  className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 text-sm text-white font-semibold rounded-2xl shadow-xl shadow-[#8B00DC]/25"
                  style={{
                    background:
                      "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)",
                  }}
                >
                  Get Started Today
                  <motion.span
                    className="inline-flex"
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </MagneticButton>

                <MagneticButton
                  strength={10}
                  onClick={() => go("#how-it-works")}
                  className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 text-sm text-[#5A5A72] hover:text-[#8B00DC] rounded-2xl border border-[#E8E0F5] bg-white shadow-sm transition-colors"
                >
                  <motion.div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)",
                    }}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                  </motion.div>
                  Watch Demo
                </MagneticButton>
              </motion.div>

              {/* Trust row */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center gap-5 pt-8 border-t border-[#8B00DC]/10"
              >
                <div className="flex items-center -space-x-3">
                  {[doctor1, doctor2, doctor3].map((src, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.2, y: -4, zIndex: 20 }}
                      transition={{ type: "spring", stiffness: 320 }}
                      className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-sm cursor-pointer"
                      style={{ zIndex: 10 - i }}
                    >
                      <img
                        src={src}
                        alt="clinician"
                        className="w-full h-full object-cover object-center"
                      />
                    </motion.div>
                  ))}
                  <div
                    className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)",
                      zIndex: 7,
                    }}
                  >
                    +
                  </div>
                </div>
                <div>
                  <div className="text-[#0D0D0D] text-sm font-semibold">
                    10+ health systems
                  </div>
                  <div className="text-[#9898A8] text-xs">
                    already using Datalet
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ——— Right — widget with faster parallax ——— */}
          <motion.div
            style={{ y: widgetY }}
            className="relative flex justify-center lg:justify-end"
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-15 blur-[100px] pointer-events-none"
              style={{
                background: "radial-gradient(circle, #AA00FF, transparent 70%)",
              }}
            />

            <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border border-dashed border-[#8B00DC]/10 pointer-events-none"
              />

              <HealthDashboardWidget />

              {/* Floating chips */}
              {/* <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 40px rgba(139,0,220,0.18)",
                }}
                className="absolute -top-5 -right-3 sm:-right-7 bg-white border border-[#E8E0F5] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl shadow-[#8B00DC]/10 cursor-default"
              >
                <div
                  className="font-black text-2xl leading-none"
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundImage:
                      "linear-gradient(135deg, #7B00CC, #CC00FF)",
                    backgroundClip: "text",
                  }}
                >
                  3.2M
                </div>
                <div className="text-[#9898A8] text-xs mt-1">Records / day</div>
              </motion.div> */}

              {/* <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{
                  delay: 1.0,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 40px rgba(170,0,255,0.18)",
                }}
                className="absolute -bottom-5 -left-3 sm:-left-7 bg-white border border-[#E8E0F5] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl shadow-[#8B00DC]/10 cursor-default"
              >
                <div className="text-[#AA00FF] font-black text-2xl leading-none">
                  98%
                </div>
                <div className="text-[#9898A8] text-xs mt-1">
                  Patient Satisfaction
                </div>
              </motion.div> */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="relative z-10 flex justify-center pb-10">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-[#9898A8] text-xs"
        >
          <div className="w-5 h-8 rounded-full border border-[#8B00DC]/20 flex justify-center pt-1.5">
            <div
              className="w-0.5 h-2 rounded-full"
              style={{
                background: "linear-gradient(to bottom, #7B00CC, #CC00FF)",
              }}
            />
          </div>
          scroll
        </motion.div>
      </div>
    </section>
  );
}
