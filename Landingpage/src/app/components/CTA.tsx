import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MagneticButton } from "./ui/MagneticButton";
import { ParallaxLayer } from "./ui/ParallaxLayer";
import { TiltCard } from "./ui/TiltCard";

const imgDoctorPortrait = "https://images.unsplash.com/photo-1758691461516-7e716e0ca135?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgPatient        = "https://images.unsplash.com/photo-1765222385062-11262da1ff2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
// Replaced nurse → healthcare AI tech visual
const imgAIHeath        = "https://images.unsplash.com/photo-1745591915039-d2b1962483d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

const trustAvatars = [
  "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  "https://images.unsplash.com/photo-1666887360742-974c8fce8e6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  "https://images.unsplash.com/photo-1659353887019-b142198f2668?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
];

const programs = [
  { title: "12-Week Metabolic Reset",  subtitle: "Diabetes & Hypertension", desc: "AI-guided programme combining continuous glucose monitoring, personalised nutrition, and weekly physician check-ins.", img: imgDoctorPortrait, accent: "#8B00DC" },
  { title: "GLP-1 Weight Management",  subtitle: "Obesity & Pre-Diabetes",   desc: "Medication-assisted weight programme with integrated behavioural coaching, food logging, and outcomes tracking.",    img: imgPatient,        accent: "#AA00FF" },
];

const benefits = [
  "Free 30-day pilot with live data",
  "Dedicated onboarding specialist",
  "Average ROI within 90 days",
  "Full HIPAA compliance guaranteed",
];



export function CTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", org: "", role: "" });

  const submit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <section id="contact" className="bg-[#FAF7FF] py-16 sm:py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Demo form */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="border border-[#E8E0F5] rounded-3xl overflow-hidden shadow-2xl shadow-[#8B00DC]/[0.08]"
        >
          <div className="grid lg:grid-cols-2">

            {/* Left panel — replaced nurse with AI health visualization + parallax */}
            <div className="relative overflow-hidden min-h-[300px] sm:min-h-[440px] lg:min-h-[520px]">
              {/* Base gradient */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(150deg, #4A0088 0%, #8800CC 45%, #BB00EE 100%)" }} />

              {/* Parallax AI tech image — wrapped so absolute fill isn't overridden by ParallaxLayer's own relative */}
              <div className="absolute inset-0 overflow-hidden">
                <ParallaxLayer speed={-0.2} className="h-full">
                  <img
                    src={imgAIHeath}
                    alt="Healthcare AI technology"
                    className="w-full h-full object-cover opacity-20 scale-110"
                  />
                </ParallaxLayer>
              </div>

              {/* Animated particle dots */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 4 + i * 3,
                    height: 4 + i * 3,
                    left: `${15 + i * 14}%`,
                    top: `${20 + (i % 3) * 22}%`,
                    background: `rgba(255,255,255,${0.08 + i * 0.04})`,
                  }}
                  animate={{
                    y: [-8, 8, -8],
                    x: [-4, 4, -4],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 3 + i * 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />
              ))}

              {/* Animated glow orb */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.28, 0.15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[80px] pointer-events-none"
                style={{ background: "radial-gradient(circle, white, transparent 65%)" }}
              />
              <motion.div
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -top-10 -left-10 w-60 h-60 rounded-full blur-[60px] pointer-events-none"
                style={{ background: "radial-gradient(circle, #DD88FF, transparent 60%)" }}
              />

              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10 lg:p-16 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-6 h-0.5 bg-white/50 rounded" />
                    <span className="text-white/70 text-xs uppercase tracking-widest font-semibold">Get Started</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-5 leading-tight">
                    Start Your 30-Day<br />Free Pilot Today
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed mb-8 sm:mb-12">
                    Full platform access with your own data. No commitment, no credit card. A dedicated implementation specialist from day one.
                  </p>
                </div>

                <div className="pt-8 border-t border-white/20 flex items-center gap-4">
                  <div className="flex -space-x-2.5">
                    {trustAvatars.map((src, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.25, zIndex: 20, y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-9 h-9 rounded-full border-2 border-white/30 overflow-hidden cursor-pointer"
                        style={{ zIndex: 10 - i }}
                      >
                        <img src={src} alt="clinician" className="w-full h-full object-cover object-top" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs">Join 500+ health systems already using Datalet</p>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="bg-white p-8 sm:p-10 lg:p-16">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center justify-center h-full text-center py-16"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-[#8B00DC]/25"
                      style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
                    >
                      <CheckCircle2 className="w-9 h-9 text-white" />
                    </motion.div>
                    {[
                      { text: "You're In!", cls: "text-2xl font-black text-[#0D0D0D] mb-3" },
                      { text: "We'll reach out within one business day to schedule your personalised demo.", cls: "text-[#5A5A72] text-sm max-w-xs" },
                    ].map(({ text, cls }, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.1, duration: 0.45 }}
                        className={cls}
                      >{text}</motion.p>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3 className="text-xl font-bold text-[#0D0D0D] mb-8">Request a Demo</h3>
                    <form onSubmit={submit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "First Name", field: "firstName", placeholder: "John" },
                          { label: "Last Name",  field: "lastName",  placeholder: "Doe" },
                        ].map(({ label, field, placeholder }) => (
                          <div key={field}>
                            <label className="block text-xs text-[#9898A8] mb-2 font-medium">{label}</label>
                            <motion.input
                              whileFocus={{ scale: 1.01, borderColor: "rgba(139,0,220,0.45)" }}
                              type="text" required placeholder={placeholder}
                              value={(form as any)[field]}
                              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                              className="w-full bg-[#FAF7FF] border border-[#E8E0F5] text-[#0D0D0D] placeholder-[#C4B8D8] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                            />
                          </div>
                        ))}
                      </div>
                      {[
                        { label: "Work Email",   field: "email", type: "email", placeholder: "you@healthsystem.org" },
                        { label: "Organization", field: "org",   type: "text",  placeholder: "Your health system" },
                      ].map(({ label, field, type, placeholder }) => (
                        <div key={field}>
                          <label className="block text-xs text-[#9898A8] mb-2 font-medium">{label}</label>
                          <motion.input
                            whileFocus={{ scale: 1.005, borderColor: "rgba(139,0,220,0.45)" }}
                            type={type} required placeholder={placeholder}
                            value={(form as any)[field]}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            className="w-full bg-[#FAF7FF] border border-[#E8E0F5] text-[#0D0D0D] placeholder-[#C4B8D8] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs text-[#9898A8] mb-2 font-medium">Your Role</label>
                        <select required value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          className="w-full bg-[#FAF7FF] border border-[#E8E0F5] text-[#5A5A72] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#8B00DC]/40 transition-all">
                          <option value="">Select your role</option>
                          <option value="cmo">Chief Medical Officer</option>
                          <option value="cio">CIO / CTO</option>
                          <option value="coo">COO</option>
                          <option value="clinical">Clinical Leader</option>
                          <option value="analytics">Analytics / IT</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <MagneticButton
                        type="submit"
                        strength={8}
                        className="w-full py-4 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#8B00DC]/25 mt-2"
                        style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
                      >
                        Schedule My Demo
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </MagneticButton>
                      <p className="text-xs text-center text-[#C4B8D8]">No spam. Your data is safe with us.</p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}