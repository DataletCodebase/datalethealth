import { ArrowRight, LayoutDashboard, TrendingUp, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";
import { FoodAnalysisWidget, WellnessResultsWidget, HealthPlanWidget, ExpertReviewWidget } from "./HealthWidgets";

const imgPatient = "https://images.unsplash.com/photo-1765222385062-11262da1ff2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBhdGllbnQlMjByZWNvdmVyeSUyMHNtaWxpbmclMjBob3NwaXRhbHxlbnwxfHx8fDE3NzE5NDYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080";

const features = [
  { id: "01", title: "Seamless Digital Platform", description: "Physicians and patients access a unified platform — from EHR data to patient-reported outcomes, all in one secure workspace.", detail: "Role-based access · Mobile-first · Offline capable", accent: "#8B00DC", Icon: LayoutDashboard },
  { id: "02", title: "AI-Powered Trend Engine", description: "Our models surface clinical patterns and anomalies across your patient population before they become critical events.", detail: "Risk scoring · Predictive alerts · Cohort analysis", accent: "#AA00FF", Icon: TrendingUp },
  { id: "03", title: "Doctor's AI Clone", description: "Personalised AI models trained on clinical guidelines and patient history to support evidence-based care decisions at scale.", detail: "Custom models · EHR-integrated · Explainable AI", accent: "#7B00CC", Icon: BrainCircuit },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function HowItWorks() {
  const go = () => {
    const el = document.querySelector("#contact") as HTMLElement | null;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <section id="how-it-works" className="bg-[#FAF7FF] py-16 sm:py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
            <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">Our Features</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] leading-tight">Platform<br />Features</h2>
            <p className="text-[#5A5A72] max-w-sm text-sm leading-relaxed">
              AI-powered tools that bridge the gap in managing cardiometabolic disorders with improved pharmaceutical insight.
            </p>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 sm:mb-24 lg:mb-32">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(139,0,220,0.10)" }}
              className="group bg-white border border-[#E8E0F5] rounded-3xl p-6 sm:p-10 cursor-pointer transition-colors hover:border-[#8B00DC]/25"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center shadow-lg shadow-[#8B00DC]/15"
                style={{ background: `linear-gradient(135deg, ${f.accent}ee 0%, ${f.accent}88 100%)` }}
              >
                <f.Icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-bold text-[#0D0D0D] text-lg mb-3">{f.title}</h3>
              <p className="text-[#5A5A72] text-sm leading-relaxed mb-8">{f.description}</p>
              <div className="pt-5 border-t border-[#8B00DC]/[0.07] text-[#C4B8D8] text-xs">{f.detail}</div>
            </motion.div>
          ))}
        </div>

        {/* ── For Patients section ── */}
        <div className="border-t border-[#8B00DC]/[0.08] pt-16 sm:pt-20 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
              <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">For Patients</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] leading-tight">Built for<br />Patients</h2>
              <p className="text-[#5A5A72] max-w-xs text-sm leading-relaxed">
                Personalised nutrition tracking, AI wellness insights, and expert-reviewed health plans — all in one app.
              </p>
            </div>
          </motion.div>

          {/* Widgets grid */}
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* Left column — Photo + Food Analysis */}
            <div className="space-y-5">
              {/* Patient photo card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-3xl overflow-hidden border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.08] group"
                style={{ aspectRatio: "4/3" }}
              >
                <img src={imgPatient} alt="Patient using Datalet app" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0030]/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-[#8B00DC]/15 shadow-lg">
                  <div className="font-black text-lg" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC, #CC00FF)", backgroundClip: "text" }}>98%</div>
                  <div className="text-[#9898A8] text-xs">Patient Satisfaction</div>
                </div>
              </motion.div>

              <FoodAnalysisWidget />
            </div>

            {/* Middle column — Wellness Results + Health Plan */}
            <div className="space-y-5">
              <WellnessResultsWidget />
              <HealthPlanWidget />
            </div>

            {/* Right column — Expert Review + CTA */}
            <div className="space-y-5">
              <ExpertReviewWidget />

              {/* Nutrition AI CTA card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl p-8 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #5B0099 0%, #9500CC 50%, #CC00EE 100%)" }}
              >
                {/* Glow orb */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-30 blur-2xl"
                  style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
                <div className="relative z-10">
                  <div className="text-white font-black text-2xl mb-2 leading-tight">Personalised<br />Food Logging</div>
                  <p className="text-white/60 text-xs leading-relaxed mb-6">
                    Log meals visually or by voice. Datalet analyses nutritional content, glycemic impact, and your metabolic response.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={go}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl transition-all border border-white/20"
                  >
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}