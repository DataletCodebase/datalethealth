import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const clinicianAvatars = [
  "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMG1lZGljYWx8ZW58MXx8fHwxNzcxOTM1NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1666887360742-974c8fce8e6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbGUlMjBkb2N0b3IlMjBob3NwaXRhbCUyMGNvYXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcxOTQ2MTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1659353887019-b142198f2668?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMGRvY3RvciUyMHNtaWxpbmclMjBzdGV0aG9zY29wZXxlbnwxfHx8fDE3NzE5NDYxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1650784854452-6f18e97221f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwZXhlY3V0aXZlJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE5NDYxNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

const testimonials = [
  { quote: "Datalet completely changed how we use clinical data. In six months we reduced preventable readmissions by 28% — and our care teams are spending more time with patients, not paperwork.", name: "Dr. Sarah Mitchell", title: "Chief Medical Officer", org: "Regional Medical Center" },
  { quote: "The interoperability capabilities alone were worth it. We connected 14 disparate systems into one unified view. Our clinical staff finally has the complete picture they need at the point of care.", name: "James Okafor", title: "VP of Health IT", org: "St. Luke's Health System" },
  { quote: "Population health management used to feel impossible with our fragmented data. Datalet gave us the tools to identify care gaps at scale and reach patients proactively.", name: "Dr. Lisa Chen", title: "Director of Population Health", org: "Pacific Coast Medical Group" },
  { quote: "Datalet stands out for their clinical depth and implementation support. They're not just a technology company — they're a healthcare company that does technology.", name: "Michael Torres", title: "Chief Operating Officer", org: "Valley Health Partners" },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = () => { setDirection(-1); setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1)); };
  const next = () => { setDirection(1); setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1)); };
  const t = testimonials[active];

  return (
    <section id="testimonials" className="bg-[#FAF7FF] py-16 sm:py-24 lg:py-36 relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #AA00FF, transparent 60%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
            <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">Customer Stories</span>
          </div>

          <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] leading-tight">What our<br />customers say</h2>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={prev}
                className="w-12 h-12 rounded-2xl border border-[#E8E0F5] text-[#9898A8] hover:text-[#8B00DC] hover:border-[#8B00DC]/30 flex items-center justify-center transition-all bg-white shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={next}
                className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-[#8B00DC]/25"
                style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main testimonial card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#E8E0F5] rounded-3xl p-6 sm:p-8 lg:p-14 mb-8 shadow-xl shadow-[#8B00DC]/[0.06]"
        >
          <div className="grid lg:grid-cols-[1fr_240px] gap-14 items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07, duration: 0.3, type: "spring" }}
                    >
                      <Star className="w-4 h-4" style={{ fill: "#AA00FF", color: "#AA00FF" }} />
                    </motion.span>
                  ))}
                </div>
                <div className="text-5xl sm:text-8xl font-black leading-none mb-4 opacity-10"
                  style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC, #CC00FF)", backgroundClip: "text" }}>"</div>
                <p className="text-xl lg:text-2xl text-[#0D0D0D] leading-relaxed -mt-6 sm:-mt-10 mb-12">{t.quote}</p>

                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-full opacity-40 blur-md"
                      style={{ background: "radial-gradient(circle, #AA00FF, transparent 70%)" }} />
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#8B00DC]/30">
                      <img src={clinicianAvatars[active]} alt={t.name} className="w-full h-full object-cover object-top" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[#0D0D0D]">{t.name}</div>
                    <div className="text-[#9898A8] text-sm">{t.title}</div>
                    <div className="text-sm font-semibold mt-0.5 text-[#8B00DC]">{t.org}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Large portrait */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${active}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:block"
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl opacity-15 blur-2xl"
                    style={{ background: "radial-gradient(circle, #AA00FF, transparent 70%)" }} />
                  <div className="relative w-full rounded-3xl overflow-hidden border border-[#E8E0F5] shadow-xl" style={{ aspectRatio: "3/4" }}>
                    <img src={clinicianAvatars[active]} alt={t.name} className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0030]/40 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-md border border-[#8B00DC]/15 rounded-2xl px-4 py-3 text-center shadow-lg">
                        <div className="font-black text-2xl" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC, #CC00FF)", backgroundClip: "text" }}>98%</div>
                        <div className="text-[#9898A8] text-xs">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Dots */}
        <div className="flex gap-2 justify-center mb-14">
          {testimonials.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
              animate={{ width: i === active ? 32 : 8 }}
              className="h-2 rounded-full transition-colors"
              style={{ background: i === active ? "linear-gradient(90deg, #7B00CC, #CC00FF)" : "#D4C4F0" }}
            />
          ))}
        </div>

        {/* Card strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {testimonials.map((tt, i) => (
            <motion.div
              key={i}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
              whileHover={{ y: -4 }}
              className={`relative bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all shadow-sm ${
                i === active ? "border-[#8B00DC]/30 shadow-lg shadow-[#8B00DC]/10" : "border-[#E8E0F5] opacity-55 hover:opacity-80"
              }`}
            >
              <div className="h-36 relative overflow-hidden">
                <img src={clinicianAvatars[i]} alt={tt.name} className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                {i === active && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 opacity-10"
                    style={{ background: "linear-gradient(to bottom, #AA00FF, transparent 60%)" }}
                  />
                )}
              </div>
              <div className="p-4">
                <div className="text-[#0D0D0D] text-xs font-semibold leading-snug">{tt.name}</div>
                <div className="text-[#9898A8] text-xs mt-0.5">{tt.title}</div>
                <div className="text-xs font-medium mt-1 transition-colors" style={{ color: i === active ? "#8B00DC" : "transparent" }}>
                  {tt.org}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}