import { useEffect, useRef, useState } from "react";
import { motion, animate, AnimatePresence } from "motion/react";
import { Heart, Flame, Moon, Pill, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TiltCard } from "./ui/TiltCard";

// ─── Utility: animated counter ─────────────────────────────────────────────
function useCounter(target: number, duration = 1.4, delay = 0) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const ctrl = animate(0, target, {
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => setVal(Math.round(v)),
        });
        return () => ctrl.stop();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, delay]);

  return { val, ref };
}

// ─── 1. Heart Rate Widget ───────────────────────────────────────────────────

function ecgSample(t: number): number {
  const c = ((t % 1) + 1) % 1;
  let v = 0;
  v += 0.012 * Math.sin(c * Math.PI * 80 + 1.3);
  v += 0.16  * Math.exp(-Math.pow((c - 0.120) / 0.026, 2));
  v -= 0.09  * Math.exp(-Math.pow((c - 0.382) / 0.009, 2));
  v += 1.00  * Math.exp(-Math.pow((c - 0.418) / 0.013, 2));
  v -= 0.28  * Math.exp(-Math.pow((c - 0.454) / 0.011, 2));
  v += 0.03  * Math.exp(-Math.pow((c - 0.530) / 0.040, 2));
  v += 0.26  * Math.exp(-Math.pow((c - 0.650) / 0.050, 2));
  return v;
}

function HeartRateWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef  = useRef(false);
  const bpmRef    = useRef(72);
  const [bpm, setBpm]     = useState(72);
  const [pulse, setPulse] = useState(false);
  const [trend, setTrend] = useState<"up" | "down" | "flat">("flat");

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  useEffect(() => {
    const id = setInterval(() => {
      const next = 65 + Math.floor(Math.random() * 22);
      setTrend(() => next > bpmRef.current ? "up" : next < bpmRef.current ? "down" : "flat");
      setBpm(next);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || 300;
      const h = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 60;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
      }
    };
    const t0 = setTimeout(resize, 0);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      clearTimeout(t0);
      ro.disconnect();
      return;
    }
    const MAX_BUF = 2048;
    const buf = new Float32Array(MAX_BUF);
    let writeHead = 0, phase = 0, lastTs = 0, raf = 0;
    const SCROLL_PX_SEC = 140;

    function tick(ts: number) {
      if (!lastTs) { lastTs = ts; raf = requestAnimationFrame(tick); return; }
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      const W = (canvas.width  / dpr) || 300;
      const H = (canvas.height / dpr) || 60;
      if (W < 2 || H < 2) { raf = requestAnimationFrame(tick); return; }

      const mid = H * 0.52, amp = H * 0.40;
      const pxToAdd = SCROLL_PX_SEC * dt;
      const phPerPx = (bpmRef.current / 60) / SCROLL_PX_SEC;
      for (let i = 0; i < Math.ceil(pxToAdd); i++) {
        buf[writeHead % MAX_BUF] = ecgSample(phase);
        writeHead++;
        phase += phPerPx;
        if (phase > 1000) phase -= 1000;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);

      // ECG paper grid
      ctx.lineWidth = 0.5;
      const minor = 14;
      for (let xi = 0; xi <= Math.ceil(W / minor); xi++) {
        const x = xi * minor;
        ctx.strokeStyle = xi % 5 === 0 ? "rgba(180,150,220,0.25)" : "rgba(200,180,230,0.11)";
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let yi = 0; yi <= Math.ceil(H / minor); yi++) {
        const y = yi * minor;
        ctx.strokeStyle = yi % 5 === 0 ? "rgba(180,150,220,0.25)" : "rgba(200,180,230,0.11)";
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const isHov = hoverRef.current;
      const CLEAR = isHov ? 22 : 14;

      ctx.shadowColor = isHov ? "rgba(239,68,68,0.50)" : "rgba(239,68,68,0.30)";
      ctx.shadowBlur  = isHov ? 8 : 5;
      ctx.beginPath();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth   = isHov ? 2.0 : 1.6;
      ctx.lineJoin    = "round";
      ctx.lineCap     = "round";

      let pen = false;
      for (let x = 0; x < W; x++) {
        const age = (W - 1 - x) | 0;
        if (age < CLEAR) { if (pen) { ctx.stroke(); ctx.beginPath(); pen = false; } continue; }
        const idx = ((writeHead - 1 - age) % MAX_BUF + MAX_BUF) % MAX_BUF;
        const y   = mid - buf[idx] * amp;
        if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y);
      }
      if (pen) ctx.stroke();
      ctx.shadowBlur = 0;

      // Cursor fade
      const cX   = W - CLEAR - 2;
      const fade = ctx.createLinearGradient(cX, 0, cX + CLEAR + 8, 0);
      fade.addColorStop(0,   "rgba(255,255,255,0)");
      fade.addColorStop(0.5, "rgba(255,255,255,0.88)");
      fade.addColorStop(1,   "rgba(255,255,255,1)");
      ctx.fillStyle = fade;
      ctx.fillRect(cX, 0, CLEAR + 10, H);

      // Dot
      const dotAge = CLEAR;
      const dotIdx = ((writeHead - 1 - dotAge) % MAX_BUF + MAX_BUF) % MAX_BUF;
      const dotY   = mid - buf[dotIdx] * amp;
      const dotX   = W - CLEAR;
      ctx.beginPath();
      ctx.arc(dotX, dotY, isHov ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle   = "#ef4444";
      ctx.shadowColor = "rgba(239,68,68,1)";
      ctx.shadowBlur  = isHov ? 14 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(t0); ro.disconnect(); };
  }, []);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#ef4444" : trend === "down" ? "#22c55e" : "#9898A8";

  return (
    <div
      className="h-full flex flex-col"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
    >
      <TiltCard
        intensity={8}
        glowColor="rgba(239,68,68,0.12)"
        className="flex-1 flex flex-col bg-white border border-[#E8E0F5] rounded-3xl p-6 relative overflow-hidden cursor-default"
      >
        <AnimatePresence>
          {pulse && (
            <motion.div
              key="pulse-bg"
              initial={{ opacity: 0.16, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.18), transparent 70%)" }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-start justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <motion.div
              animate={pulse ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.45 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(239,68,68,0.10)" }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </motion.div>
            <span className="text-xs text-[#9898A8] font-medium">Heart Rate</span>
          </div>
          <motion.div
            key={bpm}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: trendColor }}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TrendIcon className="w-3 h-3" /> Live
          </motion.div>
        </div>

        <div className="flex items-end gap-2 mb-3 shrink-0">
          <motion.span
            key={bpm}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl font-black text-[#0D0D0D] leading-none tabular-nums"
          >
            {bpm}
          </motion.span>
          <span className="text-[#9898A8] text-sm mb-1">BPM</span>
        </div>

        {/* Canvas fills remaining height */}
        <div className="flex-1 rounded-xl overflow-hidden relative" style={{ minHeight: 52 }}>
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        <div className="flex justify-between mt-2 shrink-0">
          {["60", "65", "70", "75", "80"].map((v, i) => (
            <span key={i} className="text-[9px] text-[#C4B8D8]">{v}</span>
          ))}
        </div>
      </TiltCard>
    </div>
  );
}

// ─── 2. Activity Rings ─────────────────────────────────────────────────────
const RINGS = [
  { label: "Move",     color: "#ef4444", progress: 0.78, value: "468", unit: "kcal", r: 44 },
  { label: "Exercise", color: "#AA00FF", progress: 0.62, value: "37",  unit: "min",  r: 33 },
  { label: "Stand",    color: "#22c55e", progress: 0.91, value: "11",  unit: "hrs",  r: 22 },
];

function ActivityRingsWidget() {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 60, cy = 60;

  return (
    <TiltCard
      intensity={10}
      glowColor="rgba(170,0,255,0.10)"
      className="h-full flex flex-col bg-white border border-[#E8E0F5] rounded-3xl p-6 cursor-default"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.10)" }}>
          <Flame className="w-4 h-4 text-red-500" />
        </div>
        <span className="text-xs text-[#9898A8] font-medium">Activity Rings</span>
      </div>

      {/* Ring chart — fills available width */}
      <div className="flex-1 flex flex-col items-center justify-between">
        <svg viewBox="0 0 120 120" className="w-full max-w-[160px]" style={{ flex: "1 1 auto", minHeight: 0 }}>
          {RINGS.map((ring, i) => {
            // scale radii to fit new 60,60 center in 120x120 viewBox
            const r = [50, 37, 24][i];
            const circumference = 2 * Math.PI * r;
            const dash = circumference * ring.progress;
            const isHov = hovered === i;
            return (
              <g key={ring.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring.color} strokeOpacity={0.12} strokeWidth={isHov ? 10 : 8} />
                <motion.circle
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={isHov ? 11 : 8.5}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset: circumference - dash }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 + i * 0.3, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{ rotate: "-90deg", transformOrigin: `${cx}px ${cy}px` } as any}
                  animate={isHov ? { strokeWidth: 11, filter: `drop-shadow(0 0 6px ${ring.color}99)` } : {}}
                />
              </g>
            );
          })}
        </svg>

        {/* Labels with progress bars — fills bottom of card */}
        <div className="w-full flex flex-col gap-3 mt-3">
          {RINGS.map((ring, i) => (
            <motion.div
              key={ring.label}
              className="cursor-pointer"
              whileHover={{ x: 3 }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ring.color }} />
                  <span className="text-xs text-[#9898A8]">{ring.label}</span>
                </div>
                <span className="text-xs font-bold text-[#0D0D0D]">
                  {ring.value}<span className="text-[#9898A8] font-normal ml-0.5">{ring.unit}</span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1 rounded-full overflow-hidden" style={{ background: ring.color + "18" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: ring.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${ring.progress * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.0, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                  animate={{ scaleY: hovered === i ? 2 : 1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </TiltCard>
  );
}

// ─── 3. Blood Glucose Gauge ────────────────────────────────────────────────
function BloodGlucoseWidget() {
  const value = 94;
  const min = 70, max = 180;
  const pct = (value - min) / (max - min);

  // Semicircle gauge: centre (64, 56), radius 46
  const cx = 64, cy = 56, R = 46;
  // Upper semicircle: from left (cx-R, cy) → top (cx, cy-R) → right (cx+R, cy)
  // sweep-flag=1 = clockwise on screen = goes UP from left to right ✓
  const arcPath = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  const arcLen  = Math.PI * R; // exact half-circumference

  // Needle angle: −90° = left end, 0° = top, +90° = right end
  const needleAngle = -90 + pct * 180;
  const needleColor = value < 70 ? "#3b82f6" : value < 100 ? "#22c55e" : value < 126 ? "#f59e0b" : "#ef4444";

  const zones = [
    { label: "Low",    color: "#3b82f6" },
    { label: "Normal", color: "#22c55e" },
    { label: "Pre-D",  color: "#f59e0b" },
    { label: "High",   color: "#ef4444" },
  ];

  // Animate needle by writing SVG transform attribute directly —
  // avoids all CSS transform-origin issues with SVG elements.
  const needleRef   = useRef<SVGGElement>(null);
  const svgRef      = useRef<SVGSVGElement>(null);
  const didAnimate  = useRef(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !didAnimate.current) {
        didAnimate.current = true;
        const ctrl = animate(-90, needleAngle, {
          duration: 1.4,
          delay: 0.45,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => {
            needleRef.current?.setAttribute("transform", `rotate(${v})`);
          },
        });
        return () => ctrl.stop();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [needleAngle]);

  return (
    <TiltCard
      intensity={8}
      glowColor="rgba(34,197,94,0.10)"
      className="h-full flex flex-col bg-white border border-[#E8E0F5] rounded-3xl p-6 cursor-default"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.12)" }}>
          <Zap className="w-4 h-4 text-green-500" />
        </div>
        <span className="text-xs text-[#9898A8] font-medium">Blood Glucose</span>
      </div>

      {/* Gauge — fills flex-1 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <svg ref={svgRef} viewBox="0 0 128 82" className="w-full">
          <defs>
            <linearGradient id="gauge-arc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#3b82f6" />
              <stop offset="28%"  stopColor="#22c55e" />
              <stop offset="64%"  stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path d={arcPath} fill="none" stroke="#F0EAF9" strokeWidth="9" strokeLinecap="round" />

          {/* Coloured fill — animates left-to-right */}
          <motion.path
            d={arcPath}
            fill="none"
            stroke="url(#gauge-arc)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={arcLen}
            initial={{ strokeDashoffset: arcLen }}
            whileInView={{ strokeDashoffset: arcLen * (1 - pct) }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Needle: pivot is at (cx, cy).
              The inner <g ref={needleRef}> starts at rotate(-90) = pointing left.
              animate() writes rotate(angle) directly onto that element. */}
          <g transform={`translate(${cx}, ${cy})`}>
            <g ref={needleRef} transform="rotate(-90)">
              {/* shaft: from hub surface (y=4) to near arc tip (y=-(R-10)) */}
              <line
                x1="0" y1="4"
                x2="0" y2={-(R - 10)}
                stroke={needleColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
            {/* Hub — drawn on top, never rotates */}
            <circle cx="0" cy="0" r="6"   fill={needleColor} />
            <circle cx="0" cy="0" r="2.5" fill="white" />
          </g>

          {/* Value label — centred below hub */}
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="15" fontWeight="800" fill="#0D0D0D">{value}</text>
          <text x={cx} y={cy + 25} textAnchor="middle" fontSize="6.5" fill="#9898A8">mg/dL</text>
        </svg>

        <span className="text-xs font-semibold -mt-1" style={{ color: needleColor }}>Normal Range ✓</span>
      </div>

      {/* Zone legend */}
      <div className="flex justify-between mt-3 pt-3 border-t border-[#F5F0FF] shrink-0">
        {zones.map((z) => (
          <motion.div key={z.label} whileHover={{ scale: 1.08, y: -2 }} className="flex flex-col items-center cursor-default">
            <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ background: z.color }} />
            <span className="text-[9px] text-[#9898A8]">{z.label}</span>
          </motion.div>
        ))}
      </div>
    </TiltCard>
  );
}

// ─── 4. Sleep Quality ──────────────────────────────────────────────────────
const SLEEP_DATA = [
  { day: "M", hrs: 6.5, deep: 1.2, rem: 1.8 },
  { day: "T", hrs: 7.2, deep: 1.5, rem: 2.0 },
  { day: "W", hrs: 5.8, deep: 0.9, rem: 1.5 },
  { day: "T", hrs: 8.0, deep: 1.8, rem: 2.3 },
  { day: "F", hrs: 7.5, deep: 1.6, rem: 2.1 },
  { day: "S", hrs: 8.5, deep: 2.0, rem: 2.5 },
  { day: "S", hrs: 7.0, deep: 1.3, rem: 1.9 },
];

function SleepWidget() {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxHrs = 9;

  return (
    <TiltCard
      intensity={7}
      glowColor="rgba(99,102,241,0.10)"
      className="h-full flex flex-col bg-white border border-[#E8E0F5] rounded-3xl p-6 cursor-default"
    >
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.10)" }}>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xs text-[#9898A8] font-medium">Sleep Quality</span>
        </div>
        <div className="flex items-center gap-3">
          {[{ label: "Deep", color: "#7B00CC" }, { label: "REM", color: "#AA00FF" }, { label: "Light", color: "#E8D5FF" }].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <span className="text-[10px] text-[#9898A8]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bars stretch to fill remaining height */}
      <div className="flex-1 flex items-end gap-2">
        {SLEEP_DATA.map((d, i) => {
          const isHov = hovered === i;
          const totalH = (d.hrs / maxHrs) * 100;
          const deepH  = (d.deep / maxHrs) * 100;
          const remH   = (d.rem  / maxHrs) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end items-center gap-0.5 relative h-full"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <AnimatePresence>
                {isHov && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0D0D0D] text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap z-20 shadow-xl"
                  >
                    {d.hrs}h total
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0D0D0D]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full flex flex-col gap-0.5 rounded-t-lg overflow-hidden" style={{ height: "100%" }}>
                <motion.div
                  className="w-full rounded-sm mt-auto"
                  style={{ background: isHov ? "#D8C4F8" : "#EDE5FA", minHeight: 2 }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${totalH - deepH - remH}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                  animate={{ scaleX: isHov ? 1.1 : 1 }}
                />
                <motion.div
                  className="w-full"
                  style={{ background: isHov ? "#BB44FF" : "#AA00FF", minHeight: 2 }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${remH}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.05 * i + 0.1, ease: [0.16, 1, 0.3, 1] }}
                  animate={{ scaleX: isHov ? 1.1 : 1 }}
                />
                <motion.div
                  className="w-full rounded-b-sm"
                  style={{ background: isHov ? "#9922EE" : "#7B00CC", minHeight: 2 }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${deepH}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.05 * i + 0.2, ease: [0.16, 1, 0.3, 1] }}
                  animate={{ scaleX: isHov ? 1.1 : 1 }}
                />
              </div>
              <span className="text-[9px] text-[#C4B8D8] mt-1 shrink-0">{d.day}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F0EAF9] shrink-0">
        <div>
          <span className="text-xl font-black text-[#0D0D0D]">7.2</span>
          <span className="text-xs text-[#9898A8] ml-1">hrs avg</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.10)", color: "#22c55e" }}>
          <span>↑</span> 12% vs last week
        </div>
      </div>
    </TiltCard>
  );
}

// ─── 5. Medication Tracker ─────────────────────────────────────────────────
const MEDS = [
  { name: "Metformin 500mg",   time: "08:00 AM", color: "#8B00DC" },
  { name: "Lisinopril 10mg",   time: "08:00 AM", color: "#AA00FF" },
  { name: "Atorvastatin 20mg", time: "09:00 PM", color: "#7B00CC" },
];

function MedicationWidget() {
  const [checked, setChecked] = useState<boolean[]>([true, true, false]);
  const [burst, setBurst] = useState<number | null>(null);

  const toggle = (i: number) => {
    setChecked((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
    if (!checked[i]) { setBurst(i); setTimeout(() => setBurst(null), 700); }
  };

  const done = checked.filter(Boolean).length;

  return (
    <TiltCard
      intensity={8}
      glowColor="rgba(139,0,220,0.10)"
      className="h-full flex flex-col bg-white border border-[#E8E0F5] rounded-3xl p-6 cursor-default"
    >
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(139,0,220,0.10)" }}>
            <Pill className="w-4 h-4" style={{ color: "#8B00DC" }} />
          </div>
          <span className="text-xs text-[#9898A8] font-medium">Medications</span>
        </div>
        <span className="text-xs font-bold" style={{ color: "#8B00DC" }}>{done}/{MEDS.length} taken</span>
      </div>

      <div className="h-1.5 rounded-full mb-4 overflow-hidden shrink-0" style={{ background: "rgba(139,0,220,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #7B00CC, #CC00FF)" }}
          animate={{ width: `${(done / MEDS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Med rows — flex-1 distributes height evenly */}
      <div className="flex-1 flex flex-col justify-around">
        {MEDS.map((med, i) => (
          <motion.div
            key={med.name}
            onClick={() => toggle(i)}
            whileHover={{ x: 4, backgroundColor: "rgba(139,0,220,0.02)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-2 rounded-xl cursor-pointer relative overflow-hidden transition-colors"
          >
            <AnimatePresence>
              {burst === i && (
                <motion.div
                  key="burst"
                  initial={{ scale: 0.5, opacity: 0.7 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(139,0,220,0.25), transparent 65%)" }}
                />
              )}
            </AnimatePresence>

            <motion.div
              className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              animate={{
                borderColor: checked[i] ? med.color : "#E8E0F5",
                backgroundColor: checked[i] ? med.color : "rgba(0,0,0,0)",
              }}
              whileTap={{ scale: 1.25 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatePresence>
                {checked[i] && (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, type: "spring" }}
                    viewBox="0 0 12 10" width="10" height="10"
                  >
                    <motion.path
                      d="M1 5 L4.5 8.5 L11 1"
                      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.25 }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate ${checked[i] ? "line-through text-[#C4B8D8]" : "text-[#0D0D0D]"}`}>
                {med.name}
              </div>
              <div className="text-[10px] text-[#9898A8]">{med.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </TiltCard>
  );
}

// ─── 6. AI Health Score ────────────────────────────────────────────────────
const SCORE_DIMS = [
  { label: "Metabolic",  pct: 0.88, color: "#7B00CC" },
  { label: "Cardiac",    pct: 0.74, color: "#AA00FF" },
  { label: "Lifestyle",  pct: 0.81, color: "#CC00FF" },
  { label: "Nutrition",  pct: 0.69, color: "#9500CC" },
];

function AIScoreWidget() {
  const { val, ref } = useCounter(87, 1.6, 0.4);
  const [hovDim, setHovDim] = useState<number | null>(null);

  return (
    <TiltCard
      intensity={10}
      glowColor="rgba(139,0,220,0.12)"
      className="h-full flex flex-col bg-white border border-[#E8E0F5] rounded-3xl p-6 cursor-default"
      style={{ background: "linear-gradient(160deg, white 60%, rgba(139,0,220,0.03) 100%)" }}
    >
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #7B00CC22, #CC00FF22)" }}>
          <Zap className="w-4 h-4" style={{ color: "#8B00DC" }} />
        </div>
        <span className="text-xs text-[#9898A8] font-medium">AI Health Score</span>
      </div>

      <div className="flex flex-col items-center mb-4 shrink-0">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#F0EAF9" strokeWidth="8" />
            <motion.circle
              cx="48" cy="48" r="40"
              fill="none" stroke="url(#score-grad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              whileInView={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - 0.87) }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7B00CC" />
                <stop offset="100%" stopColor="#CC00FF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              ref={ref as any}
              className="text-2xl font-black leading-none"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #7B00CC, #CC00FF)", backgroundClip: "text" }}
            >
              {val}
            </motion.span>
            <span className="text-[9px] text-[#9898A8]">/ 100</span>
          </div>
        </div>
        <span className="text-xs font-semibold mt-2" style={{ color: "#22c55e" }}>Excellent ✓</span>
      </div>

      {/* Dimension bars fill remaining height */}
      <div className="flex-1 flex flex-col justify-around">
        {SCORE_DIMS.map((dim, i) => (
          <div
            key={dim.label}
            onMouseEnter={() => setHovDim(i)}
            onMouseLeave={() => setHovDim(null)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-[#9898A8]">{dim.label}</span>
              <motion.span
                className="text-[10px] font-bold"
                style={{ color: dim.color }}
                animate={{ scale: hovDim === i ? 1.15 : 1 }}
              >
                {Math.round(dim.pct * 100)}%
              </motion.span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: dim.color + "18" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${dim.color}, ${dim.color}99)` }}
                initial={{ width: 0 }}
                whileInView={{ width: `${dim.pct * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                animate={{ scaleY: hovDim === i ? 2 : 1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </TiltCard>
  );
}

// ─── Master export ──────────────────────────────────────────────────────────
export function WellnessWidgetDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-28"
    >
      <div className="flex items-center gap-3 mb-8">
        <motion.div
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(34,197,94,0.10)", color: "#22c55e" }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Live Patient Dashboard
        </motion.div>
        <span className="text-[#C4B8D8] text-xs">· Updated just now</span>
      </div>

      {/*
        Two independent grid rows.
        Each row uses align-items:stretch (default) — all 4 cells get the height
        of the tallest card in that row. Each card uses h-full + flex-col to fill it.
      */}
      <div className="flex flex-col gap-4">
        {/* ── Row 1 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ alignItems: "stretch" }}>
          <div className="col-span-1 sm:col-span-2 flex flex-col"><HeartRateWidget /></div>
          <div className="col-span-1 flex flex-col"><ActivityRingsWidget /></div>
          <div className="col-span-1 flex flex-col"><BloodGlucoseWidget /></div>
        </div>

        {/* ── Row 2 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ alignItems: "stretch" }}>
          <div className="col-span-1 sm:col-span-2 flex flex-col"><SleepWidget /></div>
          <div className="col-span-1 flex flex-col"><MedicationWidget /></div>
          <div className="col-span-1 flex flex-col"><AIScoreWidget /></div>
        </div>
      </div>
    </motion.div>
  );
}