import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "./ui/TiltCard";
import { ParallaxLayer } from "./ui/ParallaxLayer";

const imgConsultation = "https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB1c2luZyUyMHRhYmxldCUyMGhlYWx0aCUyMGRhdGElMjBhbmFseXRpY3N8ZW58MXx8fHwxNzcxOTQ2MTgyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const imgMedTeam      = "https://images.unsplash.com/photo-1770221797869-81e508282ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBob3NwaXRhbCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcxOTQ2MTc5fDA&ixlib=rb-4.1.0&q=80&w=1080";
const imgClinic       = "https://images.unsplash.com/photo-1758691461932-d0aa0ebf6b31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwYXRpZW50JTIwY29uc3VsdGF0aW9uJTIwY2xpbmljJTIwZGlnaXRhbCUyMGhlYWx0aHxlbnwxfHx8fDE3NzE5NDYxNzh8MA&ixlib=rb-4.1.0&q=80&w=1080";

const posts = [
  { tag: "Case Study", gradient: "linear-gradient(135deg, #7B00CC, #CC00FF)", date: "Feb 10, 2026", title: "How Regional Medical Center Reduced Readmissions by 28%", excerpt: "A deep dive into the data strategy and platform features that helped one health system transform care transitions.", img: imgConsultation },
  { tag: "White Paper", gradient: "linear-gradient(135deg, #9500D4, #BB00EE)", date: "Jan 22, 2026", title: "The State of Healthcare AI: Moving from Hype to Clinical Value", excerpt: "Our annual research report featuring insights from 200+ health systems and clinical leaders worldwide.", img: imgMedTeam },
  { tag: "Blog", gradient: "linear-gradient(135deg, #6B00B8, #AA00FF)", date: "Jan 8, 2026", title: "5 Strategies for Effective Remote Patient Monitoring at Scale", excerpt: "Practical guidance for deploying RPM programs that engage patients and generate actionable data.", img: imgClinic },
];

export function Insights() {
  return (
    <section id="insights" className="bg-white py-16 sm:py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-0.5 rounded" style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }} />
            <span className="text-[#8B00DC] text-xs uppercase tracking-widest font-semibold">Insights & Resources</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0D0D0D] leading-tight">Insights &<br />Resources</h2>
            <motion.a
              href="#insights"
              whileHover={{ x: 3, color: "#8B00DC" }}
              className="text-[#9898A8] text-sm transition-colors flex items-center gap-2 font-medium"
            >
              View all resources <ArrowUpRight className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard
                intensity={9}
                glowColor="rgba(139,0,220,0.10)"
                className="bg-white border border-[#E8E0F5] rounded-3xl overflow-hidden hover:border-[#8B00DC]/25 transition-colors group h-full flex flex-col"
              >
                <div className="h-56 relative overflow-hidden bg-[#FAF7FF] shrink-0">
                  {/* Image parallax on hover via inner motion */}
                  <motion.img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none" />

                  {/* Tag badge */}
                  <motion.span
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
                    style={{ background: p.gradient }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {p.tag}
                  </motion.span>

                  {/* Hover corner arrow */}
                  <motion.div
                    className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    whileHover={{ scale: 1.15, rotate: -5 }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#8B00DC]" />
                  </motion.div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="text-[#C4B8D8] text-xs mb-3 font-medium">{p.date}</div>
                  <h3 className="font-bold text-[#0D0D0D] text-lg mb-3 leading-snug group-hover:text-[#8B00DC] transition-colors flex-1">
                    {p.title}
                  </h3>
                  <p className="text-[#5A5A72] text-sm leading-relaxed mb-6">{p.excerpt}</p>

                  {/* Animated underline CTA */}
                  <div className="relative flex items-center gap-1.5 text-sm font-semibold text-[#8B00DC]">
                    <motion.span whileHover={{ x: 2 }} className="flex items-center gap-1.5">
                      Read more <ArrowUpRight className="w-3.5 h-3.5" />
                    </motion.span>
                    <motion.div
                      className="absolute bottom-0 left-0 h-px bg-[#8B00DC]"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}