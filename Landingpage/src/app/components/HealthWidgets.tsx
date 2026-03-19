import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, animate } from "motion/react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import {
  Zap, Wind, Droplets, Moon, Flame, CheckCircle2,
  Activity, Apple, Footprints, GlassWater, ChevronRight
} from "lucide-react";

const weekData = [
  { day: "Mon", score: 72 }, { day: "Tue", score: 68 }, { day: "Wed", score: 75 },
  { day: "Thu", score: 78 }, { day: "Fri", score: 74 }, { day: "Sat", score: 80 },
  { day: "Today", score: 82 },
];

// ── Circular health score gauge ──────────────────────────────────────────────
function HealthScoreGauge({ score = 82, animate: shouldAnim = true }: { score?: number; animate?: boolean }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView || shouldAnim) {
      const controls = animate(0, score, {
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setProgress(v),
      });
      return () => controls.stop();
    }
  }, [inView, score, shouldAnim]);

  const offset = circ - (progress / 100) * circ;
  const deg = (progress / 100) * 240 - 120;

  return (
    <div ref={ref} className="relative flex items-center justify-center" style={{ width: 108, height: 108 }}>
      <svg width="108" height="108" style={{ transform: "rotate(-210deg)" }}>
        <circle cx="54" cy="54" r={radius} fill="none" stroke="#F0EAF8" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${circ * 0.667} ${circ * 0.333}`} />
        <circle cx="54" cy="54" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
          stroke="url(#gaugeGrad)"
          strokeDasharray={`${Math.max(0, (progress / 100) * circ * 0.667)} ${circ}`}
          style={{ transition: "stroke-dasharray 0.05s linear" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7B00CC" />
            <stop offset="100%" stopColor="#CC00FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
        <span className="font-black text-xl text-[#0D0D0D] leading-none">{Math.round(progress)}</span>
        <span className="text-[#9898A8] text-[9px] leading-none mt-0.5">/ 100</span>
        <span className="text-[#8B00DC] text-[9px] font-semibold mt-1">Good</span>
      </div>
    </div>
  );
}

// ── Animated progress bar ────────────────────────────────────────────────────
function AnimBar({ value, color }: { value: number; color: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex-1 h-1.5 rounded-full bg-[#F0EAF8] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </div>
  );
}

// ── Health Dashboard Widget ───────────────────────────────────────────────────
export function HealthDashboardWidget() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const metrics = [
    { icon: Zap, label: "Energy", value: "74%", color: "#F59E0B", bar: 74 },
    { icon: Wind, label: "Stress", value: "Low", color: "#10B981", bar: 20 },
    { icon: Droplets, label: "Hydration", value: "68%", color: "#3B82F6", bar: 68 },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white rounded-3xl border border-[#E8E0F5] shadow-2xl shadow-[#8B00DC]/10 p-5 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[#9898A8] text-[11px] font-medium">Good Morning, Alex!</div>
          <div className="text-[#0D0D0D] font-bold text-sm">Health Dashboard</div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#8B00DC]/8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8B00DC] animate-pulse" />
          <span className="text-[#8B00DC] text-[10px] font-semibold">Live</span>
        </div>
      </div>

      {/* Score + Metrics row */}
      <div className="flex items-center gap-4 mb-4">
        <HealthScoreGauge score={82} animate={inView} />
        <div className="flex-1 space-y-2.5">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <m.icon className="w-3 h-3 shrink-0" style={{ color: m.color }} />
              <span className="text-[#5A5A72] text-[10px] w-14 shrink-0">{m.label}</span>
              <AnimBar value={m.bar} color={m.color} />
              <span className="text-[10px] font-semibold text-[#0D0D0D] w-7 text-right shrink-0">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep + Calories */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-[#FAF7FF] rounded-2xl p-3 border border-[#E8E0F5]">
          <div className="flex items-center gap-1.5 mb-1">
            <Moon className="w-3 h-3 text-[#8B00DC]" />
            <span className="text-[#9898A8] text-[10px]">Sleep</span>
          </div>
          <span className="font-black text-[#0D0D0D] text-base">7.2</span>
          <span className="text-[#9898A8] text-[10px] ml-1">hrs</span>
        </div>
        <div className="bg-[#FAF7FF] rounded-2xl p-3 border border-[#E8E0F5]">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="w-3 h-3 text-[#F59E0B]" />
            <span className="text-[#9898A8] text-[10px]">Calories</span>
          </div>
          <span className="font-black text-[#0D0D0D] text-base">520</span>
          <span className="text-[#9898A8] text-[10px] ml-0.5">/ 800</span>
        </div>
      </div>

      {/* Mini chart */}
      <div className="relative">
        <div className="text-[#9898A8] text-[10px] font-medium mb-2">Weekly Progress</div>
        <div className="relative" style={{ width: '100%', height: '52px' }}>
          <ResponsiveContainer width="100%" height={52}>
            <AreaChart data={weekData} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B00DC" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8B00DC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="score" stroke="#8B00DC" strokeWidth={2}
                fill="url(#scoreGrad)" dot={false}
                activeDot={{ r: 3, fill: "#8B00DC", stroke: "white", strokeWidth: 2 }} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #E8E0F5", borderRadius: 10, fontSize: 10, padding: "4px 8px" }}
                itemStyle={{ color: "#8B00DC", fontWeight: 700 }}
                labelStyle={{ color: "#9898A8", fontSize: 9 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-1.5">
          {weekData.map((d) => (
            <span key={d.day} className={`text-[8px] ${d.day === "Today" ? "text-[#8B00DC] font-bold" : "text-[#C4B8D8]"}`}>{d.day === "Today" ? "Now" : d.day.slice(0, 1)}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Food Analysis Widget ──────────────────────────────────────────────────────
const foodImg = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";

export function FoodAnalysisWidget() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const macros = [
    { label: "Calories", value: "450", unit: "kcal", color: "#8B00DC" },
    { label: "Protein", value: "32", unit: "g", color: "#10B981" },
    { label: "Carbs", value: "48", unit: "g", color: "#F59E0B" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.07] overflow-hidden"
    >
      <div className="relative h-36 overflow-hidden">
        <img src={foodImg} alt="Grilled chicken with vegetables" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0030]/60 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2.5 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-white text-[10px] font-semibold">AI Analysing...</span>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="text-white font-bold text-sm drop-shadow">Grilled Chicken Bowl</div>
          <div className="text-white/70 text-[10px]">Tap to log meal</div>
        </div>
      </div>

      <div className="p-4">
        <div className="text-[#0D0D0D] font-bold text-sm mb-3">Food Analysis</div>
        <div className="grid grid-cols-3 gap-2">
          {macros.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="bg-[#FAF7FF] rounded-2xl p-3 text-center border border-[#E8E0F5]"
            >
              <div className="font-black text-base leading-none" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[#9898A8] text-[9px] mt-0.5">{m.unit}</div>
              <div className="text-[#5A5A72] text-[9px] font-medium mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-2.5 rounded-2xl text-white text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #7B00CC, #CC00FF)" }}
        >
          <Apple className="w-3.5 h-3.5" /> Log This Meal
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── AI Wellness Results Widget ───────────────────────────────────────────────
const clinicianAvatar = "https://images.unsplash.com/photo-1650784854452-6f18e97221f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";

export function WellnessResultsWidget() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const vitals = [
    { label: "Energy", value: "74%", badge: "Good", badgeColor: "#10B981", icon: Zap, iconColor: "#F59E0B" },
    { label: "Stress", value: "Medium", badge: "Monitor", badgeColor: "#F59E0B", icon: Activity, iconColor: "#EF4444" },
    { label: "Hydration", value: "Low", badge: "Increase", badgeColor: "#EF4444", icon: Droplets, iconColor: "#3B82F6" },
    { label: "Sleep", value: "Good", badge: "Optimal", badgeColor: "#10B981", icon: Moon, iconColor: "#8B00DC" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="bg-white rounded-3xl border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.07] p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8B00DC]/20">
            <img src={clinicianAvatar} alt="AI Advisor" className="w-full h-full object-cover object-top" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#8B00DC] border-2 border-white flex items-center justify-center">
            <Activity className="w-2 h-2 text-white" />
          </div>
        </div>
        <div>
          <div className="text-[#0D0D0D] font-bold text-sm">AI Wellness Results</div>
          <div className="text-[#9898A8] text-[10px]">Real-time analysis</div>
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        {vitals.map((v, i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0" style={{ background: v.iconColor + "18" }}>
              <v.icon className="w-3 h-3" style={{ color: v.iconColor }} />
            </div>
            <span className="text-[#5A5A72] text-[11px] w-16 shrink-0">{v.label}</span>
            <div className="flex-1 h-1 rounded-full bg-[#F0EAF8]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: v.badgeColor }}
                initial={{ width: 0 }}
                animate={inView ? { width: v.value === "Low" ? "25%" : v.value === "Medium" ? "55%" : v.value === "74%" ? "74%" : "85%" } : {}}
                transition={{ delay: 0.3 + i * 0.08, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: v.badgeColor + "18", color: v.badgeColor }}
            >{v.badge}</span>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#FAF7FF] rounded-2xl p-3 border border-[#E8E0F5]">
        <div className="text-[#0D0D0D] text-[11px] font-semibold mb-1">Wellness Summary</div>
        <p className="text-[#5A5A72] text-[10px] leading-relaxed">
          You're doing well! Increase water intake to 8 glasses and aim for 7+ hrs sleep tonight.
        </p>
      </div>
    </motion.div>
  );
}

// ── Health Plan Widget ────────────────────────────────────────────────────────
export function HealthPlanWidget() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const planItems = [
    { icon: Apple, label: "Breakfast", detail: "320 kcal", time: "8:00 AM", done: true, color: "#10B981" },
    { icon: Footprints, label: "Walk", detail: "30 min", time: "5:00 PM", done: false, color: "#8B00DC" },
    { icon: GlassWater, label: "Water", detail: "8 Glasses", time: "All day", done: false, color: "#3B82F6" },
    { icon: Moon, label: "Sleep Goal", detail: "7.5 hrs", time: "10:30 PM", done: false, color: "#AA00FF" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="bg-white rounded-3xl border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.07] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[#0D0D0D] font-bold text-sm">Your Health Plan</div>
          <div className="text-[#9898A8] text-[10px]">Today's schedule</div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: "#10B98118", color: "#10B981" }}>
          <CheckCircle2 className="w-2.5 h-2.5" />
          AI Approved
        </div>
      </div>

      <div className="space-y-2">
        {planItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.45 }}
            className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
              item.done ? "border-[#10B981]/20 bg-[#10B981]/[0.04]" : "border-[#E8E0F5] hover:border-[#8B00DC]/20"
            }`}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.color + "14" }}>
              <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#0D0D0D] text-[11px] font-semibold">{item.label}</div>
              <div className="text-[#9898A8] text-[9px]">{item.detail}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[#9898A8] text-[9px]">{item.time}</div>
              {item.done && <CheckCircle2 className="w-3 h-3 text-[#10B981] ml-auto mt-0.5" />}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-2.5 rounded-2xl text-white text-xs font-semibold flex items-center justify-center gap-1.5"
        style={{ background: "linear-gradient(135deg, #7B00CC, #CC00FF)" }}
      >
        Chat with AI Coach <ChevronRight className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}

// ── Expert Review Widget ──────────────────────────────────────────────────────
const expertAvatar = "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200";

export function ExpertReviewWidget() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="bg-white rounded-3xl border border-[#E8E0F5] shadow-xl shadow-[#8B00DC]/[0.07] p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8B00DC]/20 shrink-0">
          <img src={expertAvatar} alt="Dr. Anika Sharma" className="w-full h-full object-cover object-top" />
        </div>
        <div>
          <div className="text-[#0D0D0D] font-bold text-sm">Dr. Anika Sharma</div>
          <div className="text-[#9898A8] text-[10px]">Clinical Nutritionist</div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#10B981]/[0.08] border border-[#10B981]/20 rounded-2xl p-2.5 mb-4">
        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
        <span className="text-[#10B981] text-[11px] font-semibold">Plan Approved</span>
      </div>

      <div className="text-[#5A5A72] text-[11px] font-semibold mb-2.5">Recommendations</div>
      <div className="space-y-2">
        {[
          { rec: "Reduce Salt intake", color: "#F59E0B", emoji: "🌿" },
          { rec: "Add Omega-3 daily", color: "#8B00DC", emoji: "🐟" },
          { rec: "10,000 steps goal", color: "#10B981", emoji: "👟" },
        ].map((r, i) => (
          <motion.div
            key={r.rec}
            initial={{ opacity: 0, x: 10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="flex items-center gap-2.5 py-1.5"
          >
            <span className="text-sm">{r.emoji}</span>
            <span className="text-[#5A5A72] text-[10px] flex-1">{r.rec}</span>
            <ChevronRight className="w-3 h-3 text-[#C4B8D8]" />
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E8E0F5]">
        <div className="text-[#C4B8D8] text-[9px] italic">Digitally signed by Dr. A. Sharma, PhD</div>
      </div>
    </motion.div>
  );
}