import React from "react";
// import { useLanguage } from "../navbar";
// import { useLanguage } from "../pages/navbar.jsx";
import AutoText from "../components/AutoText";


export function AskHealthAgent({
    question,
    setQuestion,
    language,
    setLanguage,
    loading,
    handleAsk,
    handlePhotoUpload,
    setAiResponse,
    errorMsg,
    aiResponse,
}) {
    // const { t } = useLanguage();


    // new update made from ai for camera in ask agent
    const fileInputRef = React.useRef(null);

    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handlePhotoUpload(e.target.files[0]);
            // Reset input so the same file can be selected again if needed
            e.target.value = null;
        }
    };
    // Ended here   07/03/2026 12:15 AM

    return (
        <div className="main-panel">
            <div className="panel-header">
                {/* <h2>{t("askTheAgent")}</h2> */}
                <h2>
                    <AutoText>Ask The Agent</AutoText>
                </h2>
                {/* <p>{t("personalizedAdvice")}</p> */}
                <p>
                    <AutoText>Get personalized advice based on your health data</AutoText>
                </p>
            </div>

            <form onSubmit={handleAsk} className="ask-form">
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    // placeholder={t("questionPlaceholder")}
                    placeholder="Ask a question or put a photo of your food"
                    className="question-input"
                />
                <div className="form-actions">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="language-select"
                    >
                        {/* <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="trp">Kokborok</option> */}
                        <option value="en">
                            <AutoText>English</AutoText>
                        </option>
                        <option value="hi">
                            <AutoText>Hindi</AutoText>
                        </option>
                        <option value="bn">
                            <AutoText>Bengali</AutoText>
                        </option>
                        <option value="trp">
                            <AutoText>Kokborok</AutoText>
                        </option>
                    </select>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {/* {loading ? t("askingButton") : t("askButton")} */}
                        {loading ? (
                            <AutoText>Asking...</AutoText>
                        ) : (
                            <AutoText>Ask</AutoText>
                        )}
                    </button>



                    <button
                        type="button"
                        className="btn-icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        title="Upload Food Photo"
                    >
                        📸
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setQuestion("");
                            setAiResponse(null);
                        }}
                        className="btn-secondary"
                    >
                        {/* {t("clearButton")} */}
                        <AutoText>Clear</AutoText>
                    </button>
                </div>
                {errorMsg && <div className="error-message">{errorMsg}</div>}
            </form>

            <div className="response-section">
                {/* <h3>{t("aiResponse")}</h3> */}
                <h3>
                    <AutoText>AI Response</AutoText>
                </h3>
                <div className="response-container">
                    {!loading && aiResponse == null && (
                        <div className="no-response">
                            <div className="no-response-icon">💬</div>
                            {/* <p>{t("noResponse")}</p> */}
                            <p>
                                <AutoText>No response yet! Ask a question or put a photo of your food</AutoText>
                            </p>
                        </div>
                    )}

                    {!loading && aiResponse && (
                        <div className="ai-response">
                            <div className="response-text">
                                <pre
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        margin: 0,
                                        fontFamily: "inherit",
                                        color: "inherit",
                                    }}
                                >
                                    {/* {aiResponse.nutrition_summary} */}
                                    <AutoText>{aiResponse.nutrition_summary}</AutoText>
                                    {aiResponse.clinical_classification ? `\nClassification: ${aiResponse.clinical_classification}` : ""}
                                    {aiResponse.clinical_reasoning ? `\nReason: ${aiResponse.clinical_reasoning}` : ""}
                                </pre>
                            </div>

                            {aiResponse.water_context && (
                                <div className="water-context">
                                    <strong>Water:</strong> {aiResponse.water_context}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Activity Widget ────────────────────────────────────────
// Replaces Water Tracker — syncs live from Activity Center APIs
// ─────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem("token"); }
function authH() { return { Authorization: `Bearer ${getToken()}` }; }

export function ActivityWidget() {
    const [todayData, setTodayData] = React.useState(null);
    const [streak, setStreak] = React.useState(0);
    const [target, setTarget] = React.useState(null);
    const [lastUpdated, setLastUpdated] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const fetchActivity = React.useCallback(async () => {
        try {
            const [todayRes, streakRes, targetRes] = await Promise.all([
                fetch("/api/activity/today", { headers: authH() }),
                fetch("/api/activity/streak", { headers: authH() }),
                fetch("/api/activity/calorie-target", { headers: authH() }),
            ]);
            if (todayRes.ok) setTodayData(await todayRes.json());
            if (streakRes.ok) { const s = await streakRes.json(); setStreak(s.streak || 0); }
            if (targetRes.ok) setTarget(await targetRes.json());
            setLastUpdated(new Date());
        } catch (e) { console.error("ActivityWidget fetch:", e); }
        finally { setLoading(false); }
    }, []);

    React.useEffect(() => {
        fetchActivity();
        const timer = setInterval(fetchActivity, 60000); // refresh every 60s
        return () => clearInterval(timer);
    }, [fetchActivity]);

    const burned = todayData ? Math.round(todayData.calories_burned || 0) : 0;
    const burnTarget = target?.burn_target || 0;
    const intakeTarget = target?.intake_target || 0;
    const consumed = todayData ? Math.round(todayData.calories_consumed || 0) : 0;
    const burnPct = burnTarget > 0 ? Math.min(100, (burned / burnTarget) * 100) : 0;
    const intakePct = intakeTarget > 0 ? Math.min(100, (consumed / intakeTarget) * 100) : 0;
    const bmi = target?.bmi;
    const bmiCat = target?.bmi_category || "";
    const bmiColor = bmi >= 40 ? '#ef4444' : bmi >= 30 ? '#f97316' : bmi >= 25 ? '#f59e0b' : '#10b981';
    const net = consumed - burned;
    const netColor = net > 300 ? '#ef4444' : net < -300 ? '#f59e0b' : '#10b981';
    const kmWalked = todayData ? (todayData.km_walked || 0) : 0;
    const kmRun = todayData ? (todayData.km_run || 0) : 0;

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(15,23,42,0.97), rgba(30,41,59,0.95))',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: 18,
            padding: '18px 20px',
            fontFamily: 'Inter, sans-serif',
            color: '#e2e8f0',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>🏃</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Today's Activity</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {bmi && (
                        <span style={{
                            fontSize: '0.62rem', fontWeight: 700, color: bmiColor,
                            background: `${bmiColor}18`, border: `1px solid ${bmiColor}44`,
                            borderRadius: 6, padding: '2px 7px'
                        }}>BMI {bmi}</span>
                    )}
                    <button onClick={fetchActivity} title="Refresh" style={{
                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: 6, color: '#818cf8', cursor: 'pointer', fontSize: '0.75rem', padding: '3px 7px'
                    }}>⟳</button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', padding: '20px 0' }}>Loading activity…</div>
            ) : (
                <>
                    {/* Streak + KM Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                        {[
                            { icon: '🔥', val: `${streak}d`, label: 'Streak', color: '#f97316' },
                            { icon: '🚶', val: `${kmWalked}km`, label: 'Walked', color: '#38bdf8' },
                            { icon: '🏃', val: `${kmRun}km`, label: 'Run', color: '#818cf8' },
                        ].map(({ icon, val, label, color }) => (
                            <div key={label} style={{
                                textAlign: 'center', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '8px 4px'
                            }}>
                                <div style={{ fontSize: '0.9rem' }}>{icon}</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color, lineHeight: 1.1 }}>{val}</div>
                                <div style={{ fontSize: '0.58rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Burn Progress */}
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginBottom: 4 }}>
                            <span>🔥 Burned Today</span>
                            <span style={{ color: '#f97316', fontWeight: 700 }}>{burned} / {burnTarget} kcal</span>
                        </div>
                        <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${burnPct}%`, borderRadius: 4,
                                background: 'linear-gradient(90deg, #f97316, #fb923c)',
                                transition: 'width 0.8s ease', boxShadow: '0 0 8px rgba(249,115,22,0.4)'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: 3 }}>
                            {burnPct >= 100 ? '🏆 Goal met!' : `${Math.round(burnPct)}% of daily burn goal`}
                        </div>
                    </div>

                    {/* Intake Progress */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginBottom: 4 }}>
                            <span>🥗 Intake Capacity</span>
                            <span style={{ color: consumed > intakeTarget ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                                {consumed > intakeTarget ? `+${consumed - intakeTarget} over` : `${Math.max(0, intakeTarget - consumed)} left`}
                            </span>
                        </div>
                        <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${Math.min(100, intakePct)}%`, borderRadius: 4,
                                background: consumed > intakeTarget
                                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                    : intakePct > 80 ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                                        : 'linear-gradient(90deg, #10b981, #34d399)',
                                transition: 'width 0.8s ease'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: 3 }}>
                            Limit: {intakeTarget} kcal/day · {bmiCat}
                        </div>
                    </div>

                    {/* Net Balance */}
                    <div style={{
                        background: `${netColor}0d`, border: `1px solid ${netColor}30`,
                        borderRadius: 12, padding: '10px 14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Balance</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: netColor, lineHeight: 1 }}>
                                {net > 0 ? '+' : ''}{net} kcal
                            </div>
                        </div>
                        <div style={{ fontSize: '1.4rem' }}>
                            {net > 300 ? '📈' : net < -300 ? '📉' : '⚖️'}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 10, fontSize: '0.6rem', color: '#334155', textAlign: 'right' }}>
                        {lastUpdated ? `Synced ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''} ·{' '}
                        <span
                            style={{ cursor: 'pointer', color: '#4f46e5', textDecoration: 'underline' }}
                            onClick={() => window.location.href = '/activity-center'}
                        >Open Activity Center →</span>
                    </div>
                </>
            )}
        </div>
    );
}

// Keep WaterTracker export for backwards compatibility (unused but not removed to avoid import errors)
export function WaterTracker({ todayTotal, handleWaterIntake, waterLogs }) {
    return null;
}

// ─────────────────────────────────────────────────────────────
// Sleep & AI Wellness Score Widget
// ─────────────────────────────────────────────────────────────
const WELLNESS_STYLES = `
@keyframes ww-spin { from { stroke-dashoffset: var(--dash-full); } to { stroke-dashoffset: var(--dash-end); } }
@keyframes ww-fade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes ww-pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35);} 50%{box-shadow:0 0 0 8px rgba(99,102,241,0);} }
@keyframes ww-bar { from{width:0} to{width:var(--w)} }
@keyframes ww-pop { from{transform:scale(.92);opacity:0} to{transform:scale(1);opacity:1} }
`;

function scoreColor(s) {
    if (s >= 85) return '#10b981';
    if (s >= 70) return '#34d399';
    if (s >= 55) return '#f59e0b';
    if (s >= 40) return '#f97316';
    if (s >= 25) return '#ef4444';
    return '#dc2626';
}

function ScoreRing({ score, size = 90 }) {
    const r = (size - 14) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const col = scoreColor(score);
    const cx = size / 2, cy = size / 2;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={col}
                strokeWidth={10} strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${col}80)`, transition: 'stroke-dasharray 1.4s cubic-bezier(.34,1.56,.64,1)' }}
            />
            <g style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
                <text x={cx} y={cy + 6} textAnchor="middle" fontSize={size * 0.22} fontWeight="900" fill={col}>{score}</text>
                <text x={cx} y={cy + 16} textAnchor="middle" fontSize={size * 0.1} fill="#475569">/100</text>
            </g>
        </svg>
    );
}

function MiniBar({ label, val, max, color, icon, textVal }) {
    const pct = max > 0 ? Math.min(100, (val / max) * 100) : 0;
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginBottom: 3 }}>
                <span>{icon} {label}</span>
                <span style={{ color, fontWeight: 700 }}>{textVal ? textVal : `${val}/${max}`}</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 1s ease', boxShadow: `0 0 6px ${color}60` }} />
            </div>
        </div>
    );
}

function HistoryPopup({ data, onClose }) {
    const maxScore = 100;
    const chartH = 110;
    const barW = 28;
    const gap = 48;
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'ww-fade .3s both'
        }} onClick={onClose}>
            <div style={{
                background: 'linear-gradient(145deg,rgba(15,23,42,.99),rgba(30,41,59,.98))',
                border: '1px solid rgba(99,102,241,.3)',
                borderRadius: 20, padding: '24px 28px', minWidth: 360, maxWidth: 480,
                animation: 'ww-pop .35s cubic-bezier(.34,1.56,.64,1) both',
                boxShadow: '0 24px 60px rgba(0,0,0,.6)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>📊 Past 7-Day Wellness</div>
                        <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: 3 }}>Score breakdown per day</div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
                        borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 10px'
                    }}>✕ Close</button>
                </div>
                {data.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#475569', padding: '30px 0', fontSize: '0.85rem' }}>No history yet — log sleep to start tracking</div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                            <svg width={Math.max(data.length * gap + 40, 300)} height={chartH + 50}>
                                <defs>
                                    {data.map((d, i) => {
                                        const col = scoreColor(d.total_score);
                                        return (
                                            <linearGradient key={i} id={`wg${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={col} stopOpacity="0.95" />
                                                <stop offset="100%" stopColor={col} stopOpacity="0.3" />
                                            </linearGradient>
                                        );
                                    })}
                                </defs>
                                {data.map((d, i) => {
                                    const bH = (d.total_score / maxScore) * chartH;
                                    const x = i * gap + 16;
                                    const col = scoreColor(d.total_score);
                                    const dayLabel = new Date(d.score_date).toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
                                    return (
                                        <g key={i}>
                                            <rect x={x} y={chartH - bH} width={barW} height={bH} fill={`url(#wg${i})`} rx={6}
                                                style={{ filter: `drop-shadow(0 0 4px ${col}50)` }} />
                                            <text x={x + barW / 2} y={chartH - bH - 6} textAnchor="middle" fontSize={10} fill={col} fontWeight={700}>{d.total_score}</text>
                                            <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={8.5} fill="#64748b">{dayLabel}</text>
                                            <text x={x + barW / 2} y={chartH + 30} textAnchor="middle" fontSize={7.5} fill="#334155">{d.score_label}</text>
                                            {d.sleep_hours > 0 && <text x={x + barW / 2} y={chartH + 42} textAnchor="middle" fontSize={7} fill="#475569">💤{d.sleep_hours}h</text>}
                                        </g>
                                    );
                                })}
                                <line x1="0" y1={chartH} x2="100%" y2={chartH} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                            </svg>
                        </div>
                        {/* Score legend */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                            {[['#10b981','85+ Excellent'],['#f59e0b','55-69 Good'],['#ef4444','<40 Critical']].map(([col, label]) => (
                                <span key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.65rem', color:'#94a3b8' }}>
                                    <span style={{ width:8, height:8, borderRadius:2, background:col, display:'inline-block' }} />{label}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function SleepWellnessWidget() {
    const [bedtime, setBedtime] = React.useState(() => localStorage.getItem('ww_bedtime') || '22:30');
    const [waketime, setWaketime] = React.useState(() => localStorage.getItem('ww_waketime') || '06:30');
    const [todayScore, setTodayScore] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [history, setHistory] = React.useState([]);
    const [showPopup, setShowPopup] = React.useState(false);
    const [activityData, setActivityData] = React.useState(null);
    const [targetData, setTargetData] = React.useState(null);
    const [saveMsg, setSaveMsg] = React.useState('');

    const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    // Calculate sleep hours from time inputs
    function calcSleepHours(b, w) {
        if (!b || !w) return 0;
        const [bH, bM] = b.split(':').map(Number);
        const [wH, wM] = w.split(':').map(Number);
        let bedMins = bH * 60 + bM;
        let wakeMins = wH * 60 + wM;
        if (wakeMins <= bedMins) wakeMins += 24 * 60;
        return Math.round(((wakeMins - bedMins) / 60) * 10) / 10;
    }

    const sleepHours = calcSleepHours(bedtime, waketime);

    const fetchAll = React.useCallback(async () => {
        try {
            const [todayRes, actRes, targetRes, histRes] = await Promise.all([
                fetch('/api/wellness/today', { headers: authH() }),
                fetch('/api/activity/today', { headers: authH() }),
                fetch('/api/activity/calorie-target', { headers: authH() }),
                fetch('/api/wellness/history', { headers: authH() }),
            ]);
            if (todayRes.ok) { const d = await todayRes.json(); setTodayScore(d); if (d?.bedtime) setBedtime(d.bedtime); if (d?.waketime) setWaketime(d.waketime); }
            if (actRes.ok) setActivityData(await actRes.json());
            if (targetRes.ok) setTargetData(await targetRes.json());
            if (histRes.ok) setHistory(await histRes.json());
        } catch (e) { console.error('WellnessWidget:', e); }
    }, []);

    React.useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 60000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    // Midnight auto-reset
    React.useEffect(() => {
        const now = new Date();
        const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
        const msUntil = midnight - now;
        const t = setTimeout(() => { setTodayScore(null); fetchAll(); }, msUntil);
        return () => clearTimeout(t);
    }, [fetchAll]);

    const handleSave = async () => {
        setSaving(true); setSaveMsg('');
        try {
            const res = await fetch('/api/wellness/log', {
                method: 'POST',
                headers: { ...authH(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ bedtime, waketime })
            });
            if (res.ok) {
                const d = await res.json();
                setTodayScore(d);
                setSaveMsg('✅ Score Synchronized!');
                await fetchAll();
            } else setSaveMsg('❌ Error');
        } catch { setSaveMsg('❌ Connection Failed'); }
        finally { setSaving(false); setTimeout(() => setSaveMsg(''), 4000); }
    };

    const score = todayScore?.total_score ?? null;
    const col = score !== null ? scoreColor(score) : '#475569';
    const label = todayScore?.score_label || '—';

    return (
        <>
            <style>{WELLNESS_STYLES}</style>
            {showPopup && <HistoryPopup data={history} onClose={() => setShowPopup(false)} />}

            <div style={{
                background: 'linear-gradient(145deg, rgba(15,23,42,0.97), rgba(30,41,59,0.95))',
                border: '1px solid rgba(99,102,241,0.18)',
                borderRadius: 18, padding: '18px 20px', marginTop: 14,
                fontFamily: 'Inter,sans-serif', color: '#e2e8f0',
                position: 'relative', overflow: 'hidden',
                animation: 'ww-fade .5s both',
                transition: 'box-shadow .3s, border-color .3s',
            }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'; }}
            >
                {/* Ambient glow */}
                <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)', pointerEvents:'none' }} />

                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:'1.15rem' }}>🧠</span>
                        <div>
                            <div style={{ fontSize:'0.88rem', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.01em' }}>Sleep & Wellness Score</div>
                            <div style={{ fontSize:'0.6rem', color:'#475569', marginTop:1 }}>AI-computed · auto-resets at midnight</div>
                        </div>
                    </div>
                    <button onClick={() => setShowPopup(true)} style={{
                        background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.28)',
                        borderRadius:8, color:'#818cf8', cursor:'pointer', fontSize:'0.65rem',
                        padding:'4px 10px', fontWeight:700, transition:'all .25s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.25)'; e.currentTarget.style.transform='scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.12)'; e.currentTarget.style.transform='scale(1)'; }}
                    >📈 Past 7 Days</button>
                </div>

                {/* Score Ring + breakdown */}
                <div style={{ display:'flex', gap:20, alignItems:'center', marginBottom:16 }}>
                    <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        {score !== null
                            ? <ScoreRing score={score} size={88} />
                            : <div style={{ width:88, height:88, borderRadius:'50%', background:'rgba(255,255,255,0.03)', border:'2px dashed rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>🔒</div>
                        }
                        <div style={{ fontSize:'0.68rem', fontWeight:700, color:col }}>{label}</div>
                    </div>
                    <div style={{ flex:1 }}>
                        <MiniBar label="Sleep Quality" val={todayScore?.sleep_score ?? 0} max={35} color="#818cf8" icon="💤" />
                        <MiniBar label="Activity" val={todayScore?.activity_score ?? 0} max={40} color="#f97316" icon="🏃" />
                        <MiniBar label="Anxiety Level" val={todayScore?.anxiety_score ?? 0} max={25} color="#10b981" icon="🧘" textVal={todayScore?.anxiety_level} />
                    </div>
                </div>

                {/* Sleep input row */}
                <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
                    <div style={{ fontSize:'0.65rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10, fontWeight:700 }}>🛌 Sleep Schedule</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                        {[
                            { label:'Bedtime', val:bedtime, set:v => { setBedtime(v); localStorage.setItem('ww_bedtime', v); }, icon:'🌙' },
                            { label:'Wake Up', val:waketime, set:v => { setWaketime(v); localStorage.setItem('ww_waketime', v); }, icon:'☀️' },
                        ].map(({ label, val, set, icon }) => (
                            <div key={label}>
                                <div style={{ fontSize:'0.6rem', color:'#475569', marginBottom:4, fontWeight:600 }}>{icon} {label}</div>
                                <input type="time" value={val} onChange={e => set(e.target.value)} style={{
                                    width:'100%', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.25)',
                                    borderRadius:8, padding:'7px 10px', color:'#e2e8f0', fontSize:'0.82rem', outline:'none',
                                    boxSizing:'border-box', transition:'border-color .25s, box-shadow .25s',
                                    WebkitAppearance:'none',
                                }}
                                    onFocus={e => { e.target.style.borderColor='#818cf8'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.2)'; }}
                                    onBlur={e => { e.target.style.borderColor='rgba(99,102,241,0.25)'; e.target.style.boxShadow='none'; }}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                        <span style={{ fontSize:'0.68rem', color:'#475569' }}>
                            Total Sleep: <b style={{ color: sleepHours >= 7 && sleepHours <= 9 ? '#10b981' : sleepHours >= 5 ? '#f59e0b' : '#ef4444' }}>{sleepHours}h</b>
                            {sleepHours >= 7 && sleepHours <= 9 ? ' ✅' : sleepHours >= 5 ? ' ⚠️' : ' ❌'}
                        </span>
                        <span style={{ fontSize:'0.62rem', color:'#334155' }}>
                            {sleepHours < 7 ? `Need ${(7 - sleepHours).toFixed(1)}h more` : sleepHours > 9 ? 'Oversleeping' : 'Optimal range!'}
                        </span>
                    </div>
                </div>

                {/* Save button */}
                <button onClick={handleSave} disabled={saving} style={{
                    width:'100%', background:'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color:'#fff', border:'none', borderRadius:10, padding:'10px',
                    fontSize:'0.82rem', fontWeight:700, cursor:saving?'not-allowed':'pointer',
                    position:'relative', overflow:'hidden', letterSpacing:'0.02em',
                    transition:'transform .25s, box-shadow .25s, filter .25s',
                    opacity: saving ? 0.65 : 1,
                }}
                    onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(99,102,241,0.45)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                >{saving ? '⏳ Computing...' : '🧠 Calculate & Save Wellness Score'}</button>
                {saveMsg && <div style={{ textAlign:'center', fontSize:'0.72rem', marginTop:6, color: saveMsg.includes('✅') ? '#10b981' : '#ef4444', animation:'ww-fade .3s both' }}>{saveMsg}</div>}

                {/* Footer sync note */}
                <div style={{ marginTop:8, fontSize:'0.58rem', color:'#334155', textAlign:'center' }}>
                    Syncs activity & diet automatically · Score resets at midnight
                </div>
            </div>
        </>
    );
}

