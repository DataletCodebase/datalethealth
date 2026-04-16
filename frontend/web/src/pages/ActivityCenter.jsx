import React, { useState, useEffect, useCallback } from "react";
import { API_BASE, getAuthHeaders } from "../apiConfig";

// ─────────────────────────────────────────────
// Animated SVG Arc Progress Ring
// ─────────────────────────────────────────────
function ArcProgress({ value, max, color, size = 120, label, sublabel, icon }) {
    const pct = max > 0 ? Math.min(value / max, 1) : 0;
    const r = (size - 22) / 2;
    const circ = 2 * Math.PI * r;
    const dash = pct * circ;
    const cx = size / 2;
    const cy = size / 2;
    const isOver = value > max;
    const gradId = `grad-${color.replace('#', '')}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={isOver ? '#ef4444' : color} stopOpacity={0.6} />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Track */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={12} />
                {/* Progress */}
                <circle
                    cx={cx} cy={cy} r={r} fill="none"
                    stroke={isOver ? '#ef4444' : `url(#${gradId})`}
                    strokeWidth={12}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    filter="url(#glow)"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />
                {/* Text (un-rotated) */}
                <g style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
                    <text x={cx} y={cy - 12} textAnchor="middle" fontSize={size * 0.18} fill={color}>{icon}</text>
                    <text x={cx} y={cy + 10} textAnchor="middle" fontSize={size * 0.16} fontWeight="900" fill="#f8fafc">{Math.round(value)}</text>
                    <text x={cx} y={cy + 24} textAnchor="middle" fontSize={size * 0.08} fontWeight="600" fill="#64748b" style={{ textTransform: 'uppercase' }}>kcal</text>
                </g>
            </svg>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isOver ? '#ef4444' : color }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2, fontWeight: 500 }}>{sublabel}</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────
function authHeaders() {
    return getAuthHeaders();
}

function fmtDate(d) {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

// ─────────────────────────────────────────────
// Inline chart drawn with SVG (no recharts dependency risk)
// Simple bar chart built with SVG for reliability
// ─────────────────────────────────────────────
function MiniBarChart({ data, keys, colors, title }) {
    if (!data || data.length === 0) return <div className="ac-empty">No data yet</div>;

    const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1);
    const chartH = 160;
    const barW = Math.max(8, Math.min(22, (100 / data.length) - 2));

    return (
        <div className="ac-chart-wrap">
            {title && <div className="ac-chart-title">{title}</div>}
            <div className="ac-chart-legend">
                {keys.map((k, i) => (
                    <span key={k} className="ac-legend-item">
                        <span className="ac-legend-dot" style={{ background: colors[i] }} />
                        {k.replace(/_/g, " ")}
                    </span>
                ))}
            </div>
            <div className="ac-chart-scroll">
                <svg width={Math.max(data.length * (keys.length * (barW + 2) + 6), 300)} height={chartH + 50}>
                    {data.map((d, di) => (
                        <g key={di} transform={`translate(${di * (keys.length * (barW + 2) + 6)}, 0)`}>
                            {keys.map((k, ki) => {
                                const val = d[k] || 0;
                                const barH = (val / maxVal) * chartH;
                                return (
                                    <g key={ki}>
                                        <rect
                                            x={ki * (barW + 2)}
                                            y={chartH - barH}
                                            width={barW}
                                            height={barH}
                                            fill={colors[ki]}
                                            rx={3}
                                            opacity={0.85}
                                        />
                                        {val > 0 && (
                                            <text
                                                x={ki * (barW + 2) + barW / 2}
                                                y={chartH - barH - 4}
                                                textAnchor="middle"
                                                fontSize={9}
                                                fill="#94a3b8"
                                            >
                                                {val % 1 === 0 ? val : val.toFixed(1)}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                            <text
                                x={(keys.length * (barW + 2)) / 2 - barW / 2}
                                y={chartH + 14}
                                textAnchor="middle"
                                fontSize={9}
                                fill="#64748b"
                            >
                                {fmtDate(d.log_date)}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Monthly Calendar Heatmap
// ─────────────────────────────────────────────
function CalendarHeatmap({ days, year, month, onDayClick, selectedDay }) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun

    const dayMap = {};
    (days || []).forEach(d => {
        const key = new Date(d.log_date).getDate();
        dayMap[key] = d;
    });

    const maxCal = Math.max(...Object.values(dayMap).map(d => d.calories_burned || 0), 1);

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className="ac-calendar">
            {dayNames.map(n => (
                <div key={n} className="ac-cal-header">{n}</div>
            ))}
            {cells.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} className="ac-cal-cell empty" />;
                const data = dayMap[d];
                const cal = data ? data.calories_burned || 0 : 0;
                const intensity = cal > 0 ? Math.max(0.15, cal / maxCal) : 0;
                const isToday = new Date().getDate() === d && new Date().getMonth() + 1 === month && new Date().getFullYear() === year;
                const isSelected = selectedDay === d;
                return (
                    <div
                        key={d}
                        className={`ac-cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${cal > 0 ? "active" : ""}`}
                        style={{ background: cal > 0 ? `rgba(99,102,241,${intensity})` : "" }}
                        title={data ? `${cal} kcal burned` : "No activity"}
                        onClick={() => onDayClick(d, data)}
                    >
                        <span className="ac-cal-day">{d}</span>
                        {cal > 0 && <span className="ac-cal-cal">{Math.round(cal)}</span>}
                    </div>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────
// Motivational Quotes
// ─────────────────────────────────────────────
const FITNESS_QUOTES = [
    { text: "The only bad workout is the one that didn't happen.", icon: "🏋️" },
    { text: "Run when you can, walk if you have to, crawl if you must — just never give up.", icon: "🏃" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", icon: "💪" },
    { text: "Sweat is just fat crying.", icon: "🔥" },
    { text: "Every step is a step closer to your goal.", icon: "👟" },
    { text: "You don't have to be great to start, but you have to start to be great.", icon: "⚡" },
    { text: "Push yourself because no one else is going to do it for you.", icon: "🎯" },
    { text: "Fitness is not a destination, it's a way of life.", icon: "🌟" },
    { text: "One hour of exercise is 4% of your day. No excuses.", icon: "⏱️" },
    { text: "A walk a day keeps the doctor away.", icon: "🚶" },
    { text: "Strength doesn't come from what you can do. It comes from overcoming what you couldn't.", icon: "🦾" },
    { text: "Your future self is cheering you on — don't let them down.", icon: "🙌" },
    { text: "The gym is a temple. Respect it, use it, grow.", icon: "🏛️" },
    { text: "Wake up. Work out. Look hot. Kick ass.", icon: "💥" },
    { text: "Cardio is hardio — but so is being unhealthy.", icon: "❤️" },
    { text: "It never gets easier, you just get stronger.", icon: "🔑" },
    { text: "Run the day, or the day runs you.", icon: "🌅" },
    { text: "Small steps every day lead to massive results.", icon: "🪜" },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function ActivityCenter() {
    const today = new Date().toISOString().split("T")[0];

    // ── Quote rotation state ──
    const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * FITNESS_QUOTES.length));
    const [quoteFade, setQuoteFade] = useState(true);
    const [quotePaused, setQuotePaused] = useState(false);

    useEffect(() => {
        if (quotePaused) return;
        const timer = setInterval(() => {
            setQuoteFade(false);
            setTimeout(() => {
                setQuoteIdx(i => (i + 1) % FITNESS_QUOTES.length);
                setQuoteFade(true);
            }, 400);
        }, 6000);
        return () => clearInterval(timer);
    }, [quotePaused]);

    const currentQuote = FITNESS_QUOTES[quoteIdx];
    const [form, setForm] = useState({
        km_walked: "",
        km_run: "",
        weight_lifting_mins: "",
        outdoor_activity_mins: "",
        notes: "",
        log_date: today,
    });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [todayCalories, setTodayCalories] = useState(null);
    const [todayConsumedCalories, setTodayConsumedCalories] = useState(0);
    const [calorieTarget, setCalorieTarget] = useState(null);

    // Data state
    const [history, setHistory] = useState([]);
    const [streak, setStreak] = useState(0);
    const [monthData, setMonthData] = useState({ days: [], totals: {} });
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDayData, setSelectedDayData] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            // Fetch calorie target in parallel
            const targetRes = await fetch(`${API_BASE}/activity/calorie-target`, { headers: authHeaders() });
            if (targetRes.ok) {
                const tData = await targetRes.json();
                setCalorieTarget(tData);
            }

            const userIdResult = await fetch(`${API_BASE}/user/profile/basic`, { headers: authHeaders() });
            let userId = "me";
            if (userIdResult.ok) {
                const ud = await userIdResult.json();
                if (ud && ud.id) userId = ud.id;
            }

            const [histRes, streakRes, monthRes, todayRes, dietRes] = await Promise.all([
                fetch(`${API_BASE}/activity/history?days=30`, { headers: authHeaders() }),
                fetch(`${API_BASE}/activity/streak`, { headers: authHeaders() }),
                fetch(`${API_BASE}/activity/monthly?year=${viewYear}&month=${viewMonth}`, { headers: authHeaders() }),
                fetch(`${API_BASE}/activity/today`, { headers: authHeaders() }),
                fetch(`${API_BASE}/meal-tracking/user/${userId}?look_date=${new Date().toISOString().split("T")[0]}`, { headers: authHeaders() })
            ]);

            if (histRes.ok) setHistory(await histRes.json());
            if (streakRes.ok) { const s = await streakRes.json(); setStreak(s.streak || 0); }
            if (monthRes.ok) setMonthData(await monthRes.json());

            if (dietRes.ok) {
                const dietData = await dietRes.json();
                if (dietData && dietData.meals) {
                    const consumed = dietData.meals.reduce((total, meal) => {
                        if (meal.status === "completed" || (meal.status === "skipped" && meal.is_alternate)) {
                            return total + (meal.calories || 0);
                        }
                        return total;
                    }, 0);
                    setTodayConsumedCalories(consumed);
                } else {
                    setTodayConsumedCalories(0);
                }
            } else {
                setTodayConsumedCalories(0);
            }

            if (todayRes.ok) {
                const t = await todayRes.json();
                if (t && t !== null && typeof t === 'object') {
                    setTodayCalories(t.calories_burned);
                    setForm(prev => ({
                        ...prev,
                        km_walked: t.km_walked || "",
                        km_run: t.km_run || "",
                        weight_lifting_mins: t.weight_lifting_mins || "",
                        outdoor_activity_mins: t.outdoor_activity_mins || "",
                        notes: t.notes || "",
                    }));
                }
            }
        } catch (err) {
            console.error("Activity fetch error:", err);
        }
    }, [viewYear, viewMonth]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Midnight auto-reset ──
    // Clears the form and refreshes all data when the clock hits 12:00 AM
    useEffect(() => {
        const resetAtMidnight = () => {
            const newToday = new Date().toISOString().split("T")[0];
            setForm({
                km_walked: "",
                km_run: "",
                weight_lifting_mins: "",
                outdoor_activity_mins: "",
                notes: "",
                log_date: newToday,
            });
            setTodayCalories(null);
            setTodayConsumedCalories(0);
            fetchAll();
        };

        // Calculate ms until next midnight (local time)
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // next midnight
        const msUntilMidnight = midnight - now;

        // Fire once at midnight, then every 24 hours after that
        const timeout = setTimeout(() => {
            resetAtMidnight();
            const interval = setInterval(resetAtMidnight, 24 * 60 * 60 * 1000);
            return () => clearInterval(interval);
        }, msUntilMidnight);

        return () => clearTimeout(timeout);
    }, [fetchAll]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg("");
        try {
            const payload = { ...form, calories_consumed: todayConsumedCalories };
            const res = await fetch(`${API_BASE}/activity/log`, {
                method: "POST",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setTodayCalories(data.calories_burned);
                setSaveMsg(`✅ Saved! ${data.calories_burned} kcal burned`);
                await fetchAll();
            } else {
                setSaveMsg("❌ Failed to save. Try again.");
            }
        } catch {
            setSaveMsg("❌ Network error.");
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(""), 4000);
        }
    };

    const handleDayClick = (day, data) => {
        setSelectedDay(day);
        setSelectedDayData(data);
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const prevMonth = () => { setViewMonth(m => { if (m === 1) { setViewYear(y => y - 1); return 12; } return m - 1; }); };
    const nextMonth = () => { setViewMonth(m => { if (m === 12) { setViewYear(y => y + 1); return 1; } return m + 1; }); };

    const totalCaloriesMonth = Math.round(monthData.totals?.calories_burned || 0);

    // Find what today's saved consumed calories are in the DB
    const todayLog = monthData.days?.find(d => fmtDate(d.log_date) === fmtDate(new Date()));
    const savedTodayConsumed = todayLog ? (todayLog.calories_consumed || 0) : 0;
    // Add any newly tracked consumed calories that haven't been saved to DB yet
    const unsavedConsumed = Math.max(0, todayConsumedCalories - savedTodayConsumed);
    const totalConsumedMonth = Math.round((monthData.totals?.calories_consumed || 0) + unsavedConsumed);

    const totalKmMonth = Math.round(((monthData.totals?.km_walked || 0) + (monthData.totals?.km_run || 0)) * 10) / 10;

    return (
        <div className="activity-center">
            <style>{`
        /* ── Import ── */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* ── Keyframes ── */
        @keyframes ac-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ac-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes ac-glow-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.25); }
          50%       { box-shadow: 0 0 22px rgba(99,102,241,0.55), 0 0 40px rgba(56,189,248,0.15); }
        }
        @keyframes ac-title-shift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes ac-dot-pulse {
          0%, 100% { background: rgba(99,102,241,0.5); transform: scale(1); }
          50%       { background: rgba(56,189,248,0.9); transform: scale(1.5); box-shadow: 0 0 8px rgba(56,189,248,0.5); }
        }
        @keyframes ac-icon-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          40%       { transform: translateY(-6px) rotate(-5deg); }
          60%       { transform: translateY(-4px) rotate(5deg); }
        }
        @keyframes ac-stat-pop {
          0%   { transform: scale(0.88); opacity: 0; }
          70%  { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ac-bar-grow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes ac-cal-ripple {
          0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.45); }
          100% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
        @keyframes ac-slide-in {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ── Container ── */
        .activity-center {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 18px;
          font-family: 'Inter', sans-serif;
          color: #e2e8f0;
        }

        /* ── Page Title ── */
        .ac-page-title {
          font-size: 1.85rem;
          font-weight: 800;
          background: linear-gradient(270deg, #818cf8, #38bdf8, #818cf8);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ac-fade-up 0.6s cubic-bezier(.22,1,.36,1) both,
                     ac-title-shift 5s ease infinite;
          margin-bottom: 22px;
          letter-spacing: -0.02em;
        }

        /* ── Grid ── */
        .ac-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .ac-grid { grid-template-columns: 1fr; } }

        /* ── Cards ── */
        .ac-card {
          background: linear-gradient(135deg, rgba(30,41,59,0.96), rgba(15,23,42,0.97));
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 18px;
          padding: 22px;
          position: relative;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.35s cubic-bezier(.22,1,.36,1),
                      border-color 0.3s;
          animation: ac-fade-up 0.55s cubic-bezier(.22,1,.36,1) both;
          will-change: transform;
        }
        .ac-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(99,102,241,0.07), transparent 65%);
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }
        .ac-card:hover {
          transform: translateY(-5px) scale(1.01);
          border-color: rgba(99,102,241,0.42);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(99,102,241,0.2),
                      0 0 30px rgba(99,102,241,0.1);
        }
        .ac-card:hover::before { opacity: 1; }

        /* Staggered entrance delays */
        .ac-card:nth-child(1) { animation-delay: 0.05s; }
        .ac-card:nth-child(2) { animation-delay: 0.12s; }
        .ac-card:nth-child(3) { animation-delay: 0.18s; }
        .ac-card:nth-child(4) { animation-delay: 0.24s; }

        /* ── Card Title ── */
        .ac-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #818cf8;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.01em;
          transition: color 0.25s;
        }
        .ac-card:hover .ac-card-title { color: #a5b4fc; }

        /* ── Stat Cards ── */
        .ac-stats-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
        .ac-stat {
          flex: 1;
          min-width: 120px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: transform 0.3s cubic-bezier(.22,1,.36,1),
                      border-color 0.3s,
                      box-shadow 0.3s;
          animation: ac-stat-pop 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        .ac-stat:nth-child(1) { animation-delay: 0.1s; }
        .ac-stat:nth-child(2) { animation-delay: 0.18s; }
        .ac-stat:nth-child(3) { animation-delay: 0.26s; }
        .ac-stat:nth-child(4) { animation-delay: 0.34s; }
        .ac-stat::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 50%, transparent 65%);
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ac-stat:hover {
          transform: translateY(-4px) scale(1.04);
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 8px 28px rgba(99,102,241,0.2);
          animation: ac-glow-pulse 2s ease-in-out infinite;
        }
        .ac-stat:hover::after { opacity: 1; animation: ac-shimmer 1.5s linear infinite; }
        .ac-stat-val {
          font-size: 2rem;
          font-weight: 800;
          color: #818cf8;
          line-height: 1;
          transition: transform 0.25s, filter 0.25s;
        }
        .ac-stat:hover .ac-stat-val { transform: scale(1.1); filter: brightness(1.3); }
        .ac-stat-label { font-size: 0.72rem; color: #64748b; margin-top: 6px; letter-spacing: 0.04em; text-transform: uppercase; }
        .ac-streak-val { color: #f97316; }
        .ac-cal-val   { color: #10b981; }
        .ac-km-val    { color: #38bdf8; }

        /* ── Form ── */
        .ac-form { display: flex; flex-direction: column; gap: 13px; }
        .ac-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ac-label {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 5px;
          display: block;
          font-weight: 500;
          letter-spacing: 0.04em;
          transition: color 0.25s;
        }
        .ac-input {
          width: 100%;
          background: rgba(15,23,42,0.85);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 10px;
          padding: 11px 13px;
          color: #e2e8f0;
          font-size: 0.9rem;
          box-sizing: border-box;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          outline: none;
        }
        .ac-input:hover {
          border-color: rgba(99,102,241,0.45);
          background: rgba(15,23,42,0.95);
        }
        .ac-input:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2), 0 0 12px rgba(99,102,241,0.12);
          background: rgba(15,23,42,1);
        }
        .ac-input:focus + .ac-label,
        .ac-input:not(:placeholder-shown) + .ac-label { color: #818cf8; }
        .ac-input::placeholder { color: #334155; }

        /* ── Save Button — shimmer + ripple ── */
        .ac-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 13px 20px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.02em;
          transition: transform 0.25s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.25s,
                      filter 0.25s;
        }
        .ac-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.18), transparent);
          transition: left 0.55s cubic-bezier(.22,1,.36,1);
        }
        .ac-btn:hover::before { left: 160%; }
        .ac-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3);
          filter: brightness(1.1);
        }
        .ac-btn:active { transform: scale(0.97); }
        .ac-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }

        /* ── Save Message ── */
        .ac-save-msg {
          font-size: 0.85rem;
          color: #10b981;
          margin-top: 6px;
          text-align: center;
          animation: ac-fade-up 0.4s both;
        }

        /* ── Charts ── */
        .ac-chart-wrap { overflow: hidden; }
        .ac-chart-title { font-size: 0.82rem; color: #64748b; margin-bottom: 8px; font-weight: 700; letter-spacing: 0.04em; }
        .ac-chart-legend { display: flex; gap: 14px; margin-bottom: 10px; flex-wrap: wrap; }
        .ac-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #94a3b8; transition: color 0.2s; }
        .ac-legend-item:hover { color: #e2e8f0; }
        .ac-legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .ac-chart-scroll { overflow-x: auto; padding-bottom: 8px; }
        .ac-chart-scroll::-webkit-scrollbar { height: 4px; }
        .ac-chart-scroll::-webkit-scrollbar-track { background: rgba(15,23,42,0.5); border-radius: 4px; }
        .ac-chart-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 4px; }
        .ac-empty { color: #334155; font-size: 0.85rem; text-align: center; padding: 28px; }

        /* Chart bar grow animation */
        .ac-chart-scroll rect:not([fill="transparent"]) {
          transform-origin: bottom;
          animation: ac-bar-grow 0.6s cubic-bezier(.22,1,.36,1) both;
        }

        /* ── Calendar ── */
        .ac-calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }
        .ac-cal-header { text-align: center; font-size: 0.68rem; color: #475569; padding: 4px 0; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
        .ac-cal-cell {
          aspect-ratio: 1;
          border-radius: 10px;
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(51,65,85,0.25);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 0.22s cubic-bezier(.22,1,.36,1),
                      border-color 0.22s,
                      box-shadow 0.22s,
                      background 0.22s;
          padding: 2px;
          position: relative;
        }
        .ac-cal-cell.empty { background: transparent; border: none; cursor: default; }
        .ac-cal-cell.today {
          border: 1.5px solid #818cf8;
          background: rgba(99,102,241,0.08);
          animation: ac-glow-pulse 2.5s ease-in-out infinite;
        }
        .ac-cal-cell.selected { border: 2px solid #38bdf8 !important; box-shadow: 0 0 12px rgba(56,189,248,0.35) !important; }
        .ac-cal-cell.active { background: rgba(99,102,241,0.12); }
        .ac-cal-cell:not(.empty):hover {
          transform: scale(1.12);
          border-color: #818cf8;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
          z-index: 2;
          animation: ac-cal-ripple 0.4s forwards;
        }
        .ac-cal-day { font-size: 0.68rem; color: #94a3b8; line-height: 1; font-weight: 500; }
        .ac-cal-cal { font-size: 0.52rem; color: white; font-weight: 700; line-height: 1.3; }

        /* ── Day Detail ── */
        .ac-day-detail {
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 12px;
          padding: 14px;
          margin-top: 14px;
          font-size: 0.82rem;
          color: #cbd5e1;
          animation: ac-slide-in 0.35s cubic-bezier(.22,1,.36,1) both;
        }
        .ac-day-detail h4 { color: #818cf8; margin: 0 0 10px 0; font-size: 0.9rem; font-weight: 700; }
        .ac-day-detail p { margin: 5px 0; transition: color 0.2s; }
        .ac-day-detail p:hover { color: #f1f5f9; }

        /* ── Month Nav ── */
        .ac-month-nav { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .ac-month-btn {
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.28);
          color: #818cf8;
          border-radius: 10px;
          padding: 7px 14px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          transition: background 0.25s, transform 0.2s, box-shadow 0.2s;
        }
        .ac-month-btn:hover {
          background: rgba(99,102,241,0.28);
          transform: scale(1.1);
          box-shadow: 0 4px 14px rgba(99,102,241,0.25);
        }
        .ac-month-btn:active { transform: scale(0.95); }
        .ac-month-label { flex: 1; text-align: center; font-weight: 700; color: #e2e8f0; font-size: 0.95rem; letter-spacing: 0.02em; }

        /* ── Monthly Totals ── */
        .ac-monthly-totals { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .ac-monthly-total-item {
          flex: 1;
          min-width: 90px;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(51,65,85,0.4);
          border-radius: 12px;
          padding: 10px 12px;
          text-align: center;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .ac-monthly-total-item:hover {
          transform: translateY(-3px);
          border-color: rgba(99,102,241,0.4);
          box-shadow: 0 6px 20px rgba(99,102,241,0.15);
        }
        .ac-monthly-total-val { font-size: 1.3rem; font-weight: 800; color: #818cf8; line-height: 1; }
        .ac-monthly-total-label { font-size: 0.67rem; color: #64748b; margin-top: 4px; letter-spacing: 0.05em; text-transform: uppercase; }

        .ac-full-width { grid-column: 1 / -1; }

        .ac-stat.glass {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ac-stat.glass:hover {
          background: rgba(45, 55, 72, 0.6);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 15px rgba(99,102,241,0.15);
        }

        /* ── Quote Banner ── */
        .ac-quote-banner {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          padding: 20px 28px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          cursor: default;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: ac-fade-up 0.6s cubic-bezier(.22,1,.36,1) both;
        }
        .ac-quote-banner:hover {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 15px 50px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.2);
          transform: translateY(-2px);
        }
        .ac-quote-icon {
          font-size: 2.2rem;
          flex-shrink: 0;
          filter: drop-shadow(0 0 10px rgba(99,102,241,0.5));
          animation: ac-icon-bounce 3s ease-in-out infinite;
        }
        .ac-quote-text {
          flex: 1;
          font-size: 1.05rem;
          font-style: italic;
          color: #e2e8f0;
          line-height: 1.6;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .ac-quote-text.hidden { opacity: 0; transform: translateY(10px); }
        .ac-quote-text.visible { opacity: 1; transform: translateY(0); }
        
        @keyframes ac-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ac-icon-bounce {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes ac-glow-pulse {
          0%, 100% { box-shadow: 0 0 5px rgba(129,140,248,0.2); }
          50% { box-shadow: 0 0 20px rgba(129,140,248,0.5); }
        }
      `}</style>

            <h1 className="ac-page-title">🏃 Activity Center</h1>

            {/* ── Motivational Quote Banner ── */}
            <div
                className="ac-quote-banner"
                onMouseEnter={() => setQuotePaused(true)}
                onMouseLeave={() => setQuotePaused(false)}
            >
                <div className="ac-quote-icon">{currentQuote.icon}</div>
                <div className={`ac-quote-text ${quoteFade ? "visible" : "hidden"}`}>
                    &ldquo;{currentQuote.text}&rdquo;
                </div>
                <div className="ac-quote-dot" />
            </div>

            {/* ── Stats Row ── */}
            <div className="ac-stats-row">
                <div className="ac-stat glass">
                    <div className="ac-stat-val ac-streak-val">{streak} 🔥</div>
                    <div className="ac-stat-label">Day Streak</div>
                </div>

                {/* Burned Stats */}
                <div className="ac-stat glass">
                    <div className="ac-stat-val ac-cal-val">{todayCalories !== null ? Math.round(todayCalories) : "0"}</div>
                    <div className="ac-stat-label">Today's kcal Burned</div>
                </div>
                <div className="ac-stat glass">
                    <div className="ac-stat-val" style={{ color: "#38bdf8" }}>{totalCaloriesMonth}</div>
                    <div className="ac-stat-label">kcal Burned Month</div>
                </div>

                {/* Consumed Stats */}
                <div className="ac-stat glass">
                    <div className="ac-stat-val" style={{ color: "#10b981" }}>{Math.round(todayConsumedCalories)}</div>
                    <div className="ac-stat-label">Today's kcal Consumed</div>
                </div>
                <div className="ac-stat glass">
                    <div className="ac-stat-val" style={{ color: "#f59e0b" }}>{Math.round(totalConsumedMonth)}</div>
                    <div className="ac-stat-label">kcal Consumed Month</div>
                </div>

                <div className="ac-stat glass">
                    <div className="ac-stat-val ac-km-val">{totalKmMonth}</div>
                    <div className="ac-stat-label">km This Month</div>
                </div>
            </div>

            {/* ── Daily Metabolic Dashboard ── */}
            {calorieTarget && (() => {
                const burnTarget = calorieTarget.burn_target;
                const intakeTarget = calorieTarget.intake_target;
                const burned = todayCalories !== null ? Math.round(todayCalories) : 0;
                const consumed = Math.round(todayConsumedCalories);
                const remainBurn = Math.max(0, burnTarget - burned);
                const remainIntake = Math.max(0, intakeTarget - consumed);
                const net = consumed - burned;
                const last7 = history.slice(-7);
                const burnPct = Math.min(100, burnTarget > 0 ? (burned / burnTarget) * 100 : 0);
                const intakePct = Math.min(100, intakeTarget > 0 ? (consumed / intakeTarget) * 100 : 0);
                const bmi = calorieTarget.bmi;
                const bmiCat = calorieTarget.bmi_category || "Normal";
                const bmiColor = bmi >= 40 ? '#dc2626' : bmi >= 35 ? '#ef4444' : bmi >= 30 ? '#f97316' : bmi >= 25 ? '#f59e0b' : '#10b981';
                const conditionsList = calorieTarget.conditions_applied || [];
                const deficit = calorieTarget.deficit || 0;
                const conditionDisplay = (calorieTarget.condition && calorieTarget.condition !== "Na" && calorieTarget.condition !== "General")
                    ? calorieTarget.condition : "General Profile";

                const metabolicState = net > 300
                    ? { label: "📈 Calorie Surplus", color: "#ef4444", desc: "Weight gain risk", icon: "⬆️" }
                    : net < -300
                        ? { label: "📉 Active Deficit", color: "#f59e0b", desc: "Weight loss mode", icon: "⬇️" }
                        : { label: "⚖️ Balanced", color: "#10b981", desc: "Maintenance mode", icon: "✅" };

                return (
                    <div style={{
                        marginBottom: 30,
                        background: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
                        border: '1px solid rgba(99,102,241,0.2)',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.1)',
                        borderRadius: 24,
                        padding: '28px 32px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Background glow */}
                        <div style={{
                            position: 'absolute', top: -80, right: -80, width: 300, height: 300,
                            borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        {/* Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                    <span style={{ fontSize: '1.4rem' }}>🎯</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Daily Metabolic Dashboard</span>
                                </div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '3px 10px', fontWeight: 700 }}>
                                        {conditionDisplay}
                                    </span>
                                    {bmi && (
                                        <span style={{ fontSize: '0.72rem', color: bmiColor, background: `${bmiColor}18`, border: `1px solid ${bmiColor}44`, borderRadius: 8, padding: '3px 10px', fontWeight: 700 }}>
                                            BMI {bmi} — {bmiCat}
                                        </span>
                                    )}
                                    {deficit > 0 && (
                                        <span style={{ fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '3px 10px', fontWeight: 700 }}>
                                            −{deficit} kcal deficit target
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live at</div>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 6, justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: '0.68rem', color: '#475569' }}>BMR <b style={{ color: '#818cf8' }}>{calorieTarget.bmr}</b></span>
                                    <span style={{ fontSize: '0.68rem', color: '#475569' }}>TDEE <b style={{ color: '#38bdf8' }}>{calorieTarget.tdee}</b></span>
                                </div>
                            </div>
                        </div>

                        {/* Main 3-column grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>

                            {/* Column 1: Arc Progress Rings */}
                            <div style={{
                                background: 'rgba(255,255,255,0.025)', borderRadius: 20, padding: '20px 16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                            }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Today's Progress</div>
                                <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
                                    <div style={{ position: 'relative', textAlign: 'center' }}>
                                        <ArcProgress value={burned} max={burnTarget} color="#f97316" size={130} icon="🔥" label={`${burned}`} sublabel={`${burnTarget} target`} />
                                        <div style={{
                                            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
                                            background: '#f97316', color: '#fff', fontSize: '0.6rem', padding: '2px 7px',
                                            borderRadius: 8, fontWeight: 800, whiteSpace: 'nowrap'
                                        }}>{Math.round(burnPct)}% BURNED</div>
                                    </div>
                                    <div style={{ position: 'relative', textAlign: 'center' }}>
                                        <ArcProgress value={consumed} max={intakeTarget} color={consumed > intakeTarget ? '#ef4444' : '#10b981'} size={130} icon="🍽️" label={`${consumed}`} sublabel={`${intakeTarget} limit`} />
                                        <div style={{
                                            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
                                            background: consumed > intakeTarget ? '#ef4444' : '#10b981', color: '#fff', fontSize: '0.6rem', padding: '2px 7px',
                                            borderRadius: 8, fontWeight: 800, whiteSpace: 'nowrap'
                                        }}>{Math.round(intakePct)}% INTAKE</div>
                                    </div>
                                </div>
                                {/* Capacity bar */}
                                <div style={{ width: '100%', marginTop: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginBottom: 4 }}>
                                        <span>Intake Capacity Remaining</span>
                                        <span style={{ color: consumed > intakeTarget ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                                            {consumed > intakeTarget ? `${consumed - intakeTarget} OVER` : `${remainIntake} kcal left`}
                                        </span>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 4, transition: 'width 1s ease',
                                            width: `${Math.min(100, intakePct)}%`,
                                            background: consumed > intakeTarget
                                                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                                : intakePct > 80 ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                                                    : 'linear-gradient(90deg, #10b981, #34d399)'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Status Metrics */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Left to burn */}
                                <div style={{
                                    background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)',
                                    borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Burn Goal</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: remainBurn === 0 ? '#10b981' : '#f97316', lineHeight: 1.1, marginTop: 2 }}>
                                            {remainBurn === 0 ? '🏆 GOAL MET!' : `${remainBurn} kcal`}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Target: {burnTarget} kcal/day</div>
                                    </div>
                                    <div style={{ fontSize: '2rem' }}>{remainBurn === 0 ? '🏆' : '🔥'}</div>
                                </div>
                                {/* Intake capacity */}
                                <div style={{
                                    background: consumed > intakeTarget ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                                    border: `1px solid ${consumed > intakeTarget ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)'}`,
                                    borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Intake Capacity</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: consumed > intakeTarget ? '#ef4444' : '#10b981', lineHeight: 1.1, marginTop: 2 }}>
                                            {consumed > intakeTarget ? `+${consumed - intakeTarget} OVER` : `${remainIntake} kcal`}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Limit: {intakeTarget} kcal/day</div>
                                    </div>
                                    <div style={{ fontSize: '2rem' }}>{consumed > intakeTarget ? '⚠️' : '🥗'}</div>
                                </div>
                                {/* Net score */}
                                <div style={{
                                    background: `${metabolicState.color}08`, border: `1px solid ${metabolicState.color}30`,
                                    borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Net Balance</div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: metabolicState.color, textShadow: `0 0 16px ${metabolicState.color}40`, lineHeight: 1.1, marginTop: 2 }}>
                                            {net > 0 ? '+' : ''}{net} kcal
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: metabolicState.color, marginTop: 2, fontWeight: 700 }}>{metabolicState.label}</div>
                                    </div>
                                    <div style={{ fontSize: '2rem' }}>{metabolicState.icon}</div>
                                </div>
                            </div>

                            {/* Column 3: Medical Conditions Panel */}
                            <div style={{
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 20, padding: '18px 20px',
                                display: 'flex', flexDirection: 'column', gap: 10
                            }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>
                                    🩺 Medical Adjustments Applied
                                </div>
                                {conditionsList.map((c, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
                                        borderRadius: 10, padding: '8px 12px',
                                        fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.5,
                                        borderLeft: '3px solid rgba(99,102,241,0.5)'
                                    }}>
                                        <span style={{ color: '#a5b4fc', fontWeight: 700 }}>#{i + 1}</span> {c}
                                    </div>
                                ))}
                                {/* Body stats */}
                                <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[
                                        { label: 'Weight', value: `${calorieTarget.weight_kg} kg`, color: '#818cf8' },
                                        { label: 'Height', value: `${calorieTarget.height_cm} cm`, color: '#38bdf8' },
                                        { label: 'Age', value: `${calorieTarget.age} yrs`, color: '#f97316' },
                                        { label: 'BMI', value: bmi ? `${bmi} (${bmiCat})` : '—', color: bmiColor },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} style={{ textAlign: 'center', background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: '8px 6px' }}>
                                            <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color, marginTop: 2 }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Weekly Trend Chart */}
                        {last7.length > 0 && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 22 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>📉 7-Day Metabolic Trend</div>
                                    <div style={{ display: 'flex', gap: 14 }}>
                                        {[['#f97316', 'Burn'], ['#10b981', 'Intake'], ['#6366f1', 'Target Line']].map(([color, label]) => (
                                            <span key={label} style={{ fontSize: '0.67rem', color, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} /> {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.015)', borderRadius: 14, padding: '16px 8px', overflowX: 'auto' }}>
                                    <svg width="100%" viewBox={`0 0 ${Math.max(last7.length * 82, 380)} 155`} preserveAspectRatio="xMidYMid meet">
                                        <defs>
                                            <linearGradient id="burnGrad7" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f97316" stopOpacity="0.95" />
                                                <stop offset="100%" stopColor="#f97316" stopOpacity="0.35" />
                                            </linearGradient>
                                            <linearGradient id="intakeGrad7" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.35" />
                                            </linearGradient>
                                        </defs>
                                        {last7.map((d, i) => {
                                            const maxVal = Math.max(intakeTarget * 1.2, burnTarget * 1.2, ...last7.map(x => Math.max(x.calories_burned || 0, x.calories_consumed || 0)), 1);
                                            const scaleY = (v) => 115 - (v / maxVal) * 95;
                                            const bH = ((d.calories_burned || 0) / maxVal) * 95;
                                            const cH = ((d.calories_consumed || 0) / maxVal) * 95;
                                            const x = i * 82 + 18;
                                            const targetY = scaleY(burnTarget);
                                            const intakeLineY = scaleY(intakeTarget);
                                            return (
                                                <g key={i}>
                                                    <text x={x + 22} y={148} textAnchor="middle" fontSize={9} fill="#475569" fontWeight={500}>
                                                        {new Date(d.log_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </text>
                                                    <rect x={x} y={115 - bH} width={20} height={bH} fill="url(#burnGrad7)" rx={4} />
                                                    <rect x={x + 24} y={115 - cH} width={20} height={cH} fill="url(#intakeGrad7)" rx={4} />
                                                    <line x1={x - 4} y1={targetY} x2={x + 50} y2={targetY} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4,2" opacity={0.7} />
                                                    <line x1={x - 4} y1={intakeLineY} x2={x + 50} y2={intakeLineY} stroke="#10b981" strokeWidth={1} strokeDasharray="3,3" opacity={0.35} />
                                                    {(d.calories_burned || 0) > 0 && <text x={x + 10} y={115 - bH - 5} textAnchor="middle" fontSize={8} fill="#f97316" fontWeight={700}>{Math.round(d.calories_burned)}</text>}
                                                    {(d.calories_consumed || 0) > 0 && <text x={x + 34} y={115 - cH - 5} textAnchor="middle" fontSize={8} fill="#10b981" fontWeight={700}>{Math.round(d.calories_consumed)}</text>}
                                                </g>
                                            );
                                        })}
                                        <line x1="0" y1="115" x2="100%" y2="115" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            <div className="ac-grid">
                {/* ── Log Activity Form ── */}
                <div className="ac-card">
                    <div className="ac-card-title">📝 Log Today's Activity</div>
                    <div className="ac-form">
                        <div>
                            <label className="ac-label">📅 Date</label>
                            <input type="date" name="log_date" value={form.log_date} onChange={handleChange} className="ac-input" max={today} />
                        </div>
                        <div className="ac-form-row">
                            <div>
                                <label className="ac-label">🚶 km Walked</label>
                                <input type="number" name="km_walked" value={form.km_walked} onChange={handleChange} placeholder="0.0" min={0} step={0.1} className="ac-input" />
                            </div>
                            <div>
                                <label className="ac-label">🏃 km Run</label>
                                <input type="number" name="km_run" value={form.km_run} onChange={handleChange} placeholder="0.0" min={0} step={0.1} className="ac-input" />
                            </div>
                        </div>
                        <div className="ac-form-row">
                            <div>
                                <label className="ac-label">🏋️ Weight Lifting (mins)</label>
                                <input type="number" name="weight_lifting_mins" value={form.weight_lifting_mins} onChange={handleChange} placeholder="0" min={0} className="ac-input" />
                            </div>
                            <div>
                                <label className="ac-label">🌿 Outdoor Activity (mins)</label>
                                <input type="number" name="outdoor_activity_mins" value={form.outdoor_activity_mins} onChange={handleChange} placeholder="0" min={0} className="ac-input" />
                            </div>
                        </div>
                        <div>
                            <label className="ac-label">📝 Notes (optional)</label>
                            <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. morning jog + gym session" className="ac-input" />
                        </div>
                        <button className="ac-btn" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "💾 Save Activity"}
                        </button>
                        {saveMsg && <div className="ac-save-msg">{saveMsg}</div>}
                    </div>
                </div>

                {/* ── 30-Day Activity Chart ── */}
                <div className="ac-card">
                    <div className="ac-card-title">📊 Last 30 Days — Distance (km)</div>
                    <MiniBarChart
                        data={history}
                        keys={["km_walked", "km_run"]}
                        colors={["#38bdf8", "#818cf8"]}
                    />
                </div>

                {/* ── 30-Day Calories Chart ── */}
                <div className="ac-card">
                    <div className="ac-card-title">🔥 Last 30 Days — Calories Burned (kcal)</div>
                    <MiniBarChart
                        data={history}
                        keys={["calories_burned"]}
                        colors={["#f97316"]}
                    />
                </div>

                {/* ── Monthly Calendar ── */}
                <div className="ac-card">
                    <div className="ac-card-title">📅 Monthly Calendar</div>
                    <div className="ac-month-nav">
                        <button className="ac-month-btn" onClick={prevMonth}>‹</button>
                        <span className="ac-month-label">{monthNames[viewMonth - 1]} {viewYear}</span>
                        <button className="ac-month-btn" onClick={nextMonth}>›</button>
                    </div>
                    <div className="ac-monthly-totals">
                        <div className="ac-monthly-total-item">
                            <div className="ac-monthly-total-val" style={{ color: "#10b981" }}>{totalCaloriesMonth}</div>
                            <div className="ac-monthly-total-label">kcal burned</div>
                        </div>
                        <div className="ac-monthly-total-item">
                            <div className="ac-monthly-total-val" style={{ color: "#38bdf8" }}>{totalKmMonth}</div>
                            <div className="ac-monthly-total-label">km total</div>
                        </div>
                        <div className="ac-monthly-total-item">
                            <div className="ac-monthly-total-val" style={{ color: "#f59e0b" }}>{monthData.totals?.active_days || 0}</div>
                            <div className="ac-monthly-total-label">active days</div>
                        </div>
                    </div>
                    <CalendarHeatmap
                        days={monthData.days}
                        year={viewYear}
                        month={viewMonth}
                        onDayClick={handleDayClick}
                        selectedDay={selectedDay}
                    />
                    {selectedDayData && (
                        <div className="ac-day-detail">
                            <h4>📋 {viewMonth}/{selectedDay} — Activity Details</h4>
                            <p>🚶 Walked: <strong>{selectedDayData.km_walked || 0} km</strong></p>
                            <p>🏃 Run: <strong>{selectedDayData.km_run || 0} km</strong></p>
                            <p>🏋️ Weight Lifting: <strong>{selectedDayData.weight_lifting_mins || 0} mins</strong></p>
                            <p>🌿 Outdoor Activity: <strong>{selectedDayData.outdoor_activity_mins || 0} mins</strong></p>
                            <p>🔥 Calories Burned: <strong>{Math.round(selectedDayData.calories_burned || 0)} kcal</strong></p>
                            {selectedDayData.notes && <p>📝 Notes: {selectedDayData.notes}</p>}
                        </div>
                    )}
                    {selectedDay && !selectedDayData && (
                        <div className="ac-day-detail">
                            <h4>📋 {viewMonth}/{selectedDay}</h4>
                            <p style={{ color: "#475569" }}>No activity logged for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
