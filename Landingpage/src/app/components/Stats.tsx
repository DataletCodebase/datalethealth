import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const stats = [
  { value: 500, suffix: "+", label: "Health Systems" },
  { value: 3.2, suffix: "M+", label: "Daily Records" },
  { value: 98, suffix: "%", label: "Uptime SLA" },
  { value: 40, suffix: "%", label: "Cost Savings" },
  { value: 12, suffix: "+", label: "Years in Healthcare" },
];

function CountUp({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    const fn = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1800, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(e * target);
      if (p < 1) requestAnimationFrame(fn);
    };
    requestAnimationFrame(fn);
  }, [target, start]);
  const d = target % 1 !== 0 ? n.toFixed(1) : Math.round(n).toString();
  return <span>{d}{suffix}</span>;
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-[#FAF7FF] border-y border-[#8B00DC]/[0.08] py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`text-center group ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <motion.div
                className="text-4xl lg:text-5xl font-black tabular-nums mb-2"
                style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)", backgroundClip: "text" }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CountUp target={s.value} suffix={s.suffix} start={inView} />
              </motion.div>
              <div className="text-[#9898A8] text-sm font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 pt-12 border-t border-[#8B00DC]/[0.07]"
        >
          <p className="text-center text-[#9898A8] text-xs uppercase tracking-[0.2em] mb-10">
            Trusted by leading health organizations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12">
            {["MedStar Health", "Cleveland Clinic", "Kaiser Permanente", "Ascension", "HCA Healthcare", "Mayo Clinic"].map((o, i) => (
              <motion.span
                key={o}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                whileHover={{ color: "#8B00DC", scale: 1.05 }}
                className="text-[#C4B8D8] font-bold text-sm whitespace-nowrap cursor-default transition-colors"
              >
                {o}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}