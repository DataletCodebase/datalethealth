// import { ArrowRight, LayoutDashboard, TrendingUp, BrainCircuit } from "lucide-react";
// import { motion } from "motion/react";
// import { FoodAnalysisWidget, WellnessResultsWidget, HealthPlanWidget, ExpertReviewWidget } from "./HealthWidgets";

// const imgPatient = "https://images.unsplash.com/photo-1765222385062-11262da1ff2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBhdGllbnQlMjByZWNvdmVyeSUyMHNtaWxpbmclMjBob3NwaXRhbHxlbnwxfHx8fDE3NzE5NDYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080";

// const features = [
//   { id: "01", title: "Seamless Digital Platform", description: "Physicians and patients access a unified platform — from EHR data to patient-reported outcomes, all in one secure workspace.", detail: "Role-based access · Mobile-first · Offline capable", accent: "#8B00DC", Icon: LayoutDashboard },
//   { id: "02", title: "AI-Powered Trend Engine", description: "Our models surface clinical patterns and anomalies across your patient population before they become critical events.", detail: "Risk scoring · Predictive alerts · Cohort analysis", accent: "#AA00FF", Icon: TrendingUp },
//   { id: "03", title: "Doctor's AI Clone", description: "Personalised AI models trained on clinical guidelines and patient history to support evidence-based care decisions at scale.", detail: "Custom models · EHR-integrated · Explainable AI", accent: "#7B00CC", Icon: BrainCircuit },
// ];

// const cardVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: (i: number) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
//   }),
// };

// export function HowItWorks() {
//   const go = () => {
//     const el = document.querySelector("#contact") as HTMLElement | null;
//     if (!el) return;
//     window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
//   };

//   return (
//     <section id="how-it-works" className="bg-[#FAF7FF] py-16 sm:py-24 lg:py-36">
//       <div className="max-w-7xl mx-auto px-4 sm:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 24 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
//         >
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
//             <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">Our Features</span>
//           </div>
//           <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14 sm:mb-20">
//             <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] leading-tight">Platform<br />Features</h2>
//             <p className="text-[#5A5A72] max-w-sm text-sm leading-relaxed">
//               AI-powered tools that bridge the gap in managing cardiometabolic disorders with improved pharmaceutical insight.
//             </p>
//           </div>
//         </motion.div>

//         {/* Feature cards */}
//         <div className="grid md:grid-cols-3 gap-6 mb-16 sm:mb-24 lg:mb-32">
//           {features.map((f, i) => (
//             <motion.div
//               key={f.id}
//               custom={i}
//               variants={cardVariants}
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(139,0,220,0.10)" }}
//               className="group bg-white border border-[#E8E0F5] rounded-3xl p-6 sm:p-10 cursor-pointer transition-colors hover:border-[#8B00DC]/25"
//             >
//               <motion.div
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center shadow-lg shadow-[#8B00DC]/15"
//                 style={{ background: `linear-gradient(135deg, ${f.accent}ee 0%, ${f.accent}88 100%)` }}
//               >
//                 <f.Icon className="w-7 h-7 text-white" />
//               </motion.div>
//               <h3 className="font-bold text-[#0D0D0D] text-lg mb-3">{f.title}</h3>
//               <p className="text-[#5A5A72] text-sm leading-relaxed mb-8">{f.description}</p>
//               <div className="pt-5 border-t border-[#8B00DC]/[0.07] text-[#C4B8D8] text-xs">{f.detail}</div>
//             </motion.div>
//           ))}
//         </div>

//         {/* ── For Patients section ── */}
//         <div className="border-t border-[#8B00DC]/[0.08] pt-16 sm:pt-20 lg:pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
//           >
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
//               <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">For Patients</span>
//             </div>
//             <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 sm:mb-16">
//               <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] leading-tight">Built for<br />Patients</h2>
//               <p className="text-[#5A5A72] max-w-xs text-sm leading-relaxed">
//                 Personalised nutrition tracking, AI wellness insights, and expert-reviewed health plans — all in one app.
//               </p>
//             </div>
//           </motion.div>

//           {/* Widgets grid */}
//           <div className="grid lg:grid-cols-3 gap-6 items-start">

//             {/* Left column — Photo + Food Analysis */}
//             <div className="space-y-5">
//               {/* Patient photo card */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
//                 className="relative rounded-3xl overflow-hidden border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.08] group"
//                 style={{ aspectRatio: "4/3" }}
//               >
//                 <img src={imgPatient} alt="Patient using Datalet app" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-[#1a0030]/60 via-transparent to-transparent" />
//                 <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-[#8B00DC]/15 shadow-lg">
//                   <div className="font-black text-lg" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC, #CC00FF)", backgroundClip: "text" }}>98%</div>
//                   <div className="text-[#9898A8] text-xs">Patient Satisfaction</div>
//                 </div>
//               </motion.div>

//               <FoodAnalysisWidget />
//             </div>

//             {/* Middle column — Wellness Results + Health Plan */}
//             <div className="space-y-5">
//               <WellnessResultsWidget />
//               <HealthPlanWidget />
//             </div>

//             {/* Right column — Expert Review + CTA */}
//             <div className="space-y-5">
//               <ExpertReviewWidget />

//               {/* Nutrition AI CTA card */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: 0.25, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
//                 className="rounded-3xl p-8 relative overflow-hidden"
//                 style={{ background: "linear-gradient(135deg, #5B0099 0%, #9500CC 50%, #CC00EE 100%)" }}
//               >
//                 {/* Glow orb */}
//                 <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-30 blur-2xl"
//                   style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
//                 <div className="relative z-10">
//                   <div className="text-white font-black text-2xl mb-2 leading-tight">Personalised<br />Food Logging</div>
//                   <p className="text-white/60 text-xs leading-relaxed mb-6">
//                     Log meals visually or by voice. Datalet analyses nutritional content, glycemic impact, and your metabolic response.
//                   </p>
//                   <motion.button
//                     whileHover={{ scale: 1.04, y: -1 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={go}
//                     className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl transition-all border border-white/20"
//                   >
//                     Learn More <ArrowRight className="w-3.5 h-3.5" />
//                   </motion.button>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import {
  ArrowRight,
  LayoutDashboard,
  TrendingUp,
  BrainCircuit,
  FlaskConical,
  Microscope,
  Dna,
} from "lucide-react";
import { motion } from "motion/react";
import {
  FoodAnalysisWidget,
  WellnessResultsWidget,
  HealthPlanWidget,
  ExpertReviewWidget,
} from "./HealthWidgets";

import infectiScanImg from "../../assets/images/infectiscan.avif";
import eyeImg from "../../assets/images/eyeHealth.avif";
import dietImg from "../../assets/images/health.avif";
import metaImg from "../../assets/images/metacast.avif";
import mentalImg from "../../assets/images/mentalHealth.avif";
import speechImg from "../../assets/images/speechandHearing.avif";
import patientImg from "../../assets/images/Patient.avif";

/* ─── Data ─────────────────────────────────────────────────── */

const solutions = [
  {
    title: "InfectiScan",
    desc: "Smart diagnostic system for detecting infections in ICU patients using biosensors & AI.",
    img: infectiScanImg,
    tag: "Diagnostics",
  },
  {
    title: "Eye Health",
    desc: "Portable AI diagnostics for early eye disease detection in rural areas.",
    img: eyeImg,
    tag: "Vision Care",
  },
  {
    title: "Datalet Health",
    desc: "AI-powered preventive healthcare with personalized diet & lifestyle plans.",
    img: dietImg,
    tag: "Preventive",
  },
  {
    title: "MetaCast V1.0.0",
    desc: "AI-based drug monitoring & ADR prediction using molecular data.",
    img: metaImg,
    tag: "Pharmacology",
  },
  {
    title: "Mental Health Detection",
    desc: "AI system for detecting stress, anxiety & emotional patterns.",
    img: mentalImg,
    tag: "Mental Health",
  },
  {
    title: "Speech & Hearing",
    desc: "AI tools for diagnosing speech & hearing disorders.",
    img: speechImg,
    tag: "Neurology",
  },
];

const researchHighlights = [
  { icon: FlaskConical, text: "Clinical-grade AI models" },
  { icon: Microscope, text: "Peer-reviewed methodology" },
  { icon: Dna, text: "Genomic data integration" },
];

/* ─── Component ─────────────────────────────────────────────── */

export function HowItWorks() {
  const go = () => {
    const el = document.querySelector("#contact") as HTMLElement | null;
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 80,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden"
      style={{ background: "#F8F5FF" }}
    >
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#7B00CC 1px, transparent 1px), linear-gradient(90deg, #7B00CC 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── SECTION 1 — Datalet Research ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-20 sm:pt-28 lg:pt-36 pb-16 sm:pb-24">
        {/* Header pill + title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 sm:mb-20"
        >
          {/* Eyebrow row */}
          <div className="flex flex-wrap items-center gap-3 mb-7">
            {/* Animated pill */}
            <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C4A8F0]/50 bg-white/70 backdrop-blur-sm shadow-sm shadow-[#8B00DC]/10">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
                }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#7B00CC" }}
              >
                Datalet Research
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D0D0D] shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                Latest Research
              </span>
            </div>
          </div>

          {/* Title + description row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h2
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#0D0D0D] leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Syne', 'DM Sans', sans-serif" }}
              >
                Platform
                <br />
                <span className="relative inline-block">
                  <span
                    className="relative z-10"
                    style={{
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundImage:
                        "linear-gradient(135deg,#7B00CC 0%,#CC00FF 100%)",
                      backgroundClip: "text",
                    }}
                  >
                    Features
                  </span>
                  {/* Underline decoration */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="6"
                    viewBox="0 0 200 6"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q50 1 100 4 Q150 7 200 2"
                      stroke="url(#uline)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="uline" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7B00CC" />
                        <stop offset="100%" stopColor="#CC00FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h2>
            </div>

            <div className="max-w-sm space-y-5">
              <p className="text-[#5A5A72] text-sm leading-relaxed">
                AI-powered tools that bridge the gap in managing cardiometabolic
                disorders with improved pharmaceutical insight.
              </p>

              {/* Research highlights */}
              <div className="space-y-2">
                {researchHighlights.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg,#7B00CC22,#CC00FF22)",
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: "#8B00DC" }}
                      />
                    </div>
                    <span className="text-xs text-[#5A5A72] font-medium">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Solution cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-2xl overflow-hidden border border-[#EDE5F8] transition-all duration-300 hover:border-[#8B00DC]/30 hover:shadow-xl hover:shadow-[#8B00DC]/10"
            >
              {/* Image */}
              <div className="relative w-full h-44 bg-gradient-to-br from-[#F5EEFF] to-[#EDF5FF] flex items-center justify-center overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                />
                {/* Tag badge */}
                <div
                  className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{
                    background: "linear-gradient(135deg,#7B00CC18,#CC00FF18)",
                    color: "#8B00DC",
                    border: "1px solid #8B00DC28",
                  }}
                >
                  {item.tag}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="text-[#0D0D0D] font-bold text-base leading-snug"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <ArrowRight
                    className="w-4 h-4 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: "#8B00DC" }}
                  />
                </div>
                <p className="text-[#6B6B85] text-[13px] leading-relaxed mt-2 font-light">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="border-t border-[#8B00DC]/[0.08]" />
      </div>

      {/* ── SECTION 2 — For Patients ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-20 lg:pt-28 pb-20 sm:pb-28 lg:pb-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow row */}
          <div className="flex flex-wrap items-center gap-3 mb-7">
            <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C4A8F0]/50 bg-white/70 backdrop-blur-sm shadow-sm shadow-[#8B00DC]/10">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
                }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#7B00CC" }}
              >
                Datalet Research
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D0D0D]">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                For Patients
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 sm:mb-16">
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#0D0D0D] leading-[0.95] tracking-tight"
              style={{ fontFamily: "'Syne', 'DM Sans', sans-serif" }}
            >
              Built for
              <br />
              <span
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundImage:
                    "linear-gradient(135deg,#7B00CC 0%,#CC00FF 100%)",
                  backgroundClip: "text",
                }}
              >
                Patients
              </span>
            </h2>
            <p className="text-[#5A5A72] max-w-xs text-sm leading-relaxed">
              Personalised nutrition tracking, AI wellness insights, and
              expert-reviewed health plans — all in one app.
            </p>
          </div>
        </motion.div>

        {/* Widgets grid */}
        <div className="grid lg:grid-cols-3 gap-5 items-start">
          {/* Left column */}
          <div className="space-y-4">
            {/* Patient photo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl overflow-hidden border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.08] group"
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={patientImg}
                alt="Patient using Datalet app"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0030]/65 via-transparent to-transparent" />

              {/* Floating satisfaction badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 border border-[#8B00DC]/15 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="font-black text-2xl leading-none"
                      style={{
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundImage:
                          "linear-gradient(135deg,#7B00CC,#CC00FF)",
                        backgroundClip: "text",
                      }}
                    >
                      98%
                    </div>
                    <div className="text-[#9898A8] text-[11px] mt-0.5 font-medium">
                      Patient Satisfaction
                    </div>
                  </div>
                  {/* Mini sparkline */}
                  <svg width="56" height="24" viewBox="0 0 56 24">
                    <polyline
                      points="0,18 10,14 20,16 30,8 40,10 56,3"
                      fill="none"
                      stroke="url(#spark)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7B00CC" />
                        <stop offset="100%" stopColor="#CC00FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>
            </motion.div>

            <FoodAnalysisWidget />
          </div>

          {/* Middle column */}
          <div className="space-y-4">
            <WellnessResultsWidget />
            <HealthPlanWidget />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <ExpertReviewWidget />

            {/* CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.25,
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-2xl p-7 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg,#3D006E 0%,#7B00CC 45%,#B800EE 100%)",
              }}
            >
              {/* Decorative orbs */}
              <div
                className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-2xl"
                style={{
                  background: "radial-gradient(circle,#fff,transparent 70%)",
                }}
              />
              <div
                className="absolute bottom-0 left-4 w-20 h-20 rounded-full opacity-10 blur-xl"
                style={{
                  background: "radial-gradient(circle,#CC00FF,transparent 70%)",
                }}
              />

              {/* Subtle grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 px-2.5 py-1 rounded-full border border-white/15">
                  AI-Powered
                </div>
                <div
                  className="font-black text-2xl text-white leading-tight mb-3"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Personalised
                  <br />
                  Food Logging
                </div>
                <p className="text-white/55 text-[13px] leading-relaxed mb-6 font-light">
                  Log meals visually or by voice. Datalet analyses nutritional
                  content, glycemic impact, and your metabolic response.
                </p>
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={go}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all border border-white/20"
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
