import React, { useState, useEffect } from "react";

// import { useLanguage } from "./navbar";
import { useLanguage } from "../contexts/LanguageContext";

export default function Patients({ activeTab }) {
    const { t } = useLanguage();

    const [dietPlan, setDietPlan] = useState(null);
    const [dietStatus, setDietStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trackingMeals, setTrackingMeals] = useState([]);
    const [dietPlanId, setDietPlanId] = useState(null);

    // Alternate Meal Modal State
    const [showAlternateModal, setShowAlternateModal] = useState(false);
    const [currentAlternateMeal, setCurrentAlternateMeal] = useState(null);
    const [alternateText, setAlternateText] = useState("");
    const [alternatePhoto, setAlternatePhoto] = useState(null);
    const [alternateLoading, setAlternateLoading] = useState(false);

    // Alert Modal State
    const [lockAlert, setLockAlert] = useState("");

    // Dietary preference modal
    const [showDietPrefModal, setShowDietPrefModal] = useState(false);
    const [dietPreference, setDietPreference] = useState(null);

    const today = new Date().toISOString().split("T")[0];
    // Get today's full day name (e.g. "Monday", "Tuesday") to lock non-current days
    const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const fetchDietPlan = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/diet/my", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Unauthorized");
            const data = await res.json();
            const latestPlan = data[data.length - 1];

            // --- Expiration Logic ---
            if (latestPlan && latestPlan.created_at) {
                let dateStr = latestPlan.created_at;
                if (!dateStr.endsWith("Z") && !dateStr.includes("+")) {
                    dateStr += "Z"; // Assume UTC if no timezone is provided
                }
                const createdDate = new Date(dateStr);
                const now = new Date();
                
                if (!isNaN(createdDate.getTime())) {
                    const diffTime = Math.abs(now - createdDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays >= 7) {
                        console.log(`Diet plan is ${diffDays} days old. Expiring old plan and generating new one.`);
                        await generateDiet();
                        return; // exit early, generation will set new states
                    }
                }
            }

            setDietPlan(JSON.parse(latestPlan.ai_generated_plan));
            setDietStatus(latestPlan.status);
        } catch (err) {
            console.log("No diet found or generation failed");
        }
    };

    const generateDiet = async (dietType) => {
        try {
            setLoading(true);
            setShowDietPrefModal(false);
            const token = localStorage.getItem("token");

            if (!token) throw new Error("No token found");

            let userId = null;
            try {
                userId = JSON.parse(atob(token.split(".")[1])).id;
            } catch (e) {
                throw new Error("Invalid token format");
            }

            const res = await fetch(`http://localhost:8000/diet/generate/${userId}?diet_type=${dietType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Diet generation failed");
            }

            setDietPlan(data.diet_preview);
            setDietStatus("pending");
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "patients") {
            fetchDietPlan();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== "patients") return;
        const token = localStorage.getItem("token");
        if (!token) return;

        let userId = null;
        try {
            userId = JSON.parse(atob(token.split(".")[1])).id;
        } catch (e) {
            console.error("Invalid token");
            return;
        }

        const todayISO = new Date().toISOString().split("T")[0];

        fetch(`http://localhost:8000/diet/meal/user/${userId}?look_date=${todayISO}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then((data) => {
                setDietPlanId(data.diet_plan_id);
                setTrackingMeals(data.meals || []);
            })
            .catch((err) => console.error("Tracking fetch error:", err));
    }, [activeTab]);

    const handleMealComplete = (day, time) => {
        const trackingMeal = trackingMeals.find((m) => m.day === day && m.time === time);
        if (!trackingMeal) return;

        if (trackingMeal.status === "completed" || trackingMeal.status === "skipped") {
            setLockAlert("⚠️ This meal has already been tracked and is locked. You cannot change its status.");
            return;
        }

        const payload = {
            diet_plan_id: trackingMeal.diet_plan_id,
            diet_meal_id: trackingMeal.diet_meal_id,
            meal_date: new Date().toISOString().split("T")[0],
        };

        fetch("http://localhost:8000/diet/meal/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success || data.status === "completed") {
                    setTrackingMeals((prev) =>
                        prev.map((m) => (m.day === day && m.time === time ? { ...m, status: "completed" } : m))
                    );
                }
            })
            .catch((err) => console.error("Complete error:", err));
    };

    const handleMealSkip = (day, time) => {
        const trackingMeal = trackingMeals.find((m) => m.day === day && m.time === time);
        if (!trackingMeal) return;

        if (trackingMeal.status === "completed" || trackingMeal.status === "skipped") {
            setLockAlert("⚠️ This meal has already been tracked and is locked. You cannot change its status.");
            return;
        }

        const payload = {
            diet_plan_id: trackingMeal.diet_plan_id,
            diet_meal_id: trackingMeal.diet_meal_id,
            meal_date: new Date().toISOString().split("T")[0],
        };

        fetch("http://localhost:8000/diet/meal/skip", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success || data.status === "skipped") {
                    setTrackingMeals((prev) =>
                        prev.map((m) => (m.day === day && m.time === time ? { ...m, status: "skipped" } : m))
                    );
                }
            })
            .catch((err) => console.error("Skip error:", err));
    };

    const handleAlternateMealClick = (day, time) => {
        const trackingMeal = trackingMeals.find((m) => m.day === day && m.time === time);
        if (!trackingMeal) {
            setLockAlert("Meal not found in tracking list!");
            return;
        }

        if (trackingMeal.status === "completed" || trackingMeal.status === "skipped") {
            setLockAlert("⚠️ This meal has already been tracked and is locked. You cannot change to an alternate meal.");
            return;
        }

        setCurrentAlternateMeal({ day, time, trackingMeal });
        setAlternateText("");
        setAlternatePhoto(null);
        setShowAlternateModal(true);
    };

    const submitAlternateMeal = async () => {
        if (!alternateText && !alternatePhoto) {
            setLockAlert("Please provide either a food name or upload a photo.");
            return;
        }

        const { day, time, trackingMeal } = currentAlternateMeal;
        setAlternateLoading(true);

        const formData = new FormData();
        formData.append("diet_plan_id", trackingMeal.diet_plan_id);
        formData.append("diet_meal_id", trackingMeal.diet_meal_id);
        formData.append("meal_date", today);

        if (alternateText) formData.append("actual_meal", alternateText);
        if (alternatePhoto) formData.append("photo", alternatePhoto);

        try {
            const res = await fetch("http://localhost:8000/meal-tracking/skip-with-food", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Meal alternate failed");

            // Update local state to reflect the new AI-assessed meal
            setDietPlan((prev) => {
                const newPlan = { ...prev };
                if (newPlan[day] && newPlan[day][time]) {
                    newPlan[day][time] = {
                        ...newPlan[day][time],
                        meal: data.actual_meal || (alternateText ? alternateText : "Analyzed Food"),
                        cal: data.actual_calories || 0,
                    };
                }
                return newPlan;
            });

            setTrackingMeals((prev) =>
                prev.map((m) =>
                    m.day === day && m.time === time
                        ? { ...m, status: "skipped", actual_meal: data.actual_meal || alternateText }
                        : m
                )
            );

            setShowAlternateModal(false);
        } catch (err) {
            setLockAlert(err.message);
            console.error("Alternate meal error:", err);
        } finally {
            setAlternateLoading(false);
        }
    };

    return (
        <div className="patients-section">
            {!dietPlan && !loading && (
                <div className="generate-section">
                    <div className="generate-card">
                        <div className="card-icon">🥗</div>
                        <h2 className="card-title">Generate Your Personalized Diet Plan</h2>
                        <p className="card-description">
                            Get a customized diet plan tailored to your specific medical condition,
                            lab reports, and health goals. Our AI-powered system creates optimal
                            nutrition plans for your wellness journey.
                        </p>

                        <div className="features-list">
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Based on medical conditions</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Personalized calorie calculation</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Doctor & dietician approved</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Weekly meal scheduling</span>
                            </div>
                        </div>

                        <button className="generate-btn" onClick={() => setShowDietPrefModal(true)}>
                            <span className="btn-icon">✨</span>
                            Generate Diet Plan
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Analyzing lab reports and dietary preferences...</p>
                    <p className="sub-text">Creating your personalized 7-day meal plan</p>
                </div>
            )}

            {dietPlan && !loading && (
                <div className="diet-plan-container" style={{ position: "relative" }}>
                    {/* Pending Approval Overlay */}
                    {dietStatus !== "approved" && (
                        <div style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                            zIndex: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "12px",
                            flexDirection: "column"
                        }}>
                            <div style={{
                                background: "white", padding: "1.5rem 2.5rem", borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center",
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                                border: "1px solid #e2e8f0"
                            }}>
                                <span style={{ fontSize: "2.5rem" }}>⏳</span>
                                <h3 style={{ margin: 0, color: "#1e293b" }}>Approval Pending</h3>
                                <p style={{ margin: 0, color: "#64748b", fontWeight: 500 }}>Waiting for dietitian approval.</p>
                                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", marginTop: "-5px" }}>This diet plan is currently under review.</p>
                            </div>
                        </div>
                    )}




                    <div className="today-header">
                        <div className="today-date-info">
                            <span className="calendar-icon">📅</span>
                            <span>Today is <strong>{todayDayName}</strong>, {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <div className="today-guidance">
                            <span className="lock-icon">🔒</span> Only today's meals can be tracked
                        </div>
                    </div>

                    {(() => {
                        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                        const timeSlots = ["5:30am", "7:30am", "8:30am", "11:30am", "1:30pm", "4:00pm", "5:30pm", "7:30pm", "9:30pm"];

                        // Keep days in their standard order (Monday -> Sunday)
                        const sortedDays = [...days];

                        return (
                            <div className="table-responsive">
                                <table className="diet-table">
                                    <thead>
                                        <tr>
                                            <th className="day-header">Day</th>
                                            {timeSlots.map((time) => (
                                                <th key={time} className="time-header">
                                                    {time}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sortedDays.map((day) => {
                                            const isToday = day.toLowerCase() === todayDayName.toLowerCase();
                                            return (
                                                <tr key={day} className={`day-row${isToday ? " today-row" : " locked-row"}`}>
                                                    <td className="day-cell">
                                                        <div className="day-name">
                                                            {day}
                                                        </div>
                                                        {isToday && (
                                                            <span className="today-badge">Today</span>
                                                        )}
                                                        {!isToday && (
                                                            <span className="locked-badge" title="Only today's meals can be tracked">🔒</span>
                                                        )}
                                                    </td>

                                                    {timeSlots.map((time) => {
                                                        const meal = dietPlan[day]?.[time] || {};
                                                        const trackingMeal = trackingMeals.find(
                                                            (m) => m.day === day && m.time === time
                                                        );
                                                        const isCompleted = trackingMeal?.status === "completed";
                                                        const isSkipped = trackingMeal?.status === "skipped";

                                                        return (
                                                            <td key={time} className={`meal-cell${!isToday ? " meal-cell-locked" : ""}`}>
                                                                <div className="meal-content">
                                                                    <div className="meal-name">
                                                                        {trackingMeal ? trackingMeal.meal_name : (meal.meal || "—")}
                                                                    </div>
                                                                    <div className="meal-details">
                                                                        <span className="meal-quantity">{meal.quantity || ""}</span>
                                                                        <span className="meal-calories">
                                                                            {(trackingMeal ? trackingMeal.calories : meal.cal) ? `${trackingMeal ? trackingMeal.calories : meal.cal} cal` : ""}
                                                                        </span>
                                                                    </div>
                                                                    <div className="meal-actions">
                                                                        <div className="meal-checkbox-row">
                                                                            <label
                                                                                className={`meal-action-checkbox${!isToday ? " disabled-action" : ""}`}
                                                                                title={!isToday ? `Only today (${todayDayName}) can be tracked` : "Mark as completed"}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="completed-checkbox"
                                                                                    checked={isCompleted}
                                                                                    onChange={() => isToday && handleMealComplete(day, time)}
                                                                                    disabled={!isToday}
                                                                                />
                                                                                <span>Completed</span>
                                                                            </label>

                                                                            <label
                                                                                className={`meal-action-checkbox${!isToday ? " disabled-action" : ""}`}
                                                                                title={!isToday ? `Only today (${todayDayName}) can be tracked` : "Mark as skipped"}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="skipped-checkbox"
                                                                                    checked={isSkipped}
                                                                                    onChange={() => isToday && handleMealSkip(day, time)}
                                                                                    disabled={!isToday}
                                                                                />
                                                                                <span>Skipped</span>
                                                                            </label>
                                                                        </div>

                                                                        <button
                                                                            className={`meal-alternate-btn${!isToday ? " locked-btn" : ""}`}
                                                                            onClick={() => isToday && handleAlternateMealClick(day, time)}
                                                                            disabled={!isToday}
                                                                            title={!isToday ? `Only today (${todayDayName}) can be tracked` : "Log an alternate meal"}
                                                                        >
                                                                            {!isToday ? "🔒 Locked" : "Alternate"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            )
            }


            {/* Alternate Meal Modal */}
            {
                showAlternateModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content" style={{
                            background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e293b' }}>Skip Meal with Alternate</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                What did you eat instead? Tell us what you ate or upload a photo, and our AI will estimate the calories.
                            </p>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>
                                    Method 1: Type food name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2 slices of pizza and a coke"
                                    value={alternateText}
                                    onChange={(e) => setAlternateText(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1',
                                        borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ textAlign: 'center', margin: '1rem 0', color: '#94a3b8', fontWeight: 500 }}>
                                —— OR ——
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>
                                    Method 2: Upload a photo (AI Vision)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAlternatePhoto(e.target.files[0])}
                                    style={{
                                        width: '100%', padding: '0.5rem', border: '1px dashed #cbd5e1',
                                        borderRadius: '6px', cursor: 'pointer'
                                    }}
                                />
                                {alternatePhoto && (
                                    <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>
                                        Selected: {alternatePhoto.name}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    onClick={() => setShowAlternateModal(false)}
                                    style={{
                                        padding: '0.5rem 1rem', border: 'none', background: '#f1f5f9',
                                        color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                                    }}
                                    disabled={alternateLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitAlternateMeal}
                                    style={{
                                        padding: '0.5rem 1rem', border: 'none', background: '#0f172a',
                                        color: 'white', borderRadius: '6px', cursor: alternateLoading ? 'not-allowed' : 'pointer', fontWeight: 500
                                    }}
                                    disabled={alternateLoading || (!alternateText && !alternatePhoto)}
                                >
                                    {alternateLoading ? 'Analyzing...' : 'Submit Alternate Meal'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Dietary Preference Modal ──────────────────────────── */}
            {
                showDietPrefModal && (
                    <div className="diet-pref-overlay">
                        <div className="diet-pref-modal">
                            <button
                                className="diet-pref-close"
                                onClick={() => setShowDietPrefModal(false)}
                                title="Cancel"
                            >✕</button>

                            <div className="diet-pref-header">
                                <span className="diet-pref-emoji">🥗</span>
                                <h2>Choose Your Diet Type</h2>
                                <p>Your meals will be tailored entirely to your choice</p>
                            </div>

                            <div className="diet-pref-grid">
                                <button
                                    className="diet-pref-card veg"
                                    onClick={() => generateDiet("veg")}
                                >
                                    <span className="dpcard-icon">🌿</span>
                                    <span className="dpcard-label">Vegetarian</span>
                                    <span className="dpcard-desc">Dairy, lentils, vegetables, grains — strictly no egg or meat</span>
                                </button>

                                <button
                                    className="diet-pref-card nonveg"
                                    onClick={() => generateDiet("nonveg")}
                                >
                                    <span className="dpcard-icon">🍗</span>
                                    <span className="dpcard-label">Non-Vegetarian</span>
                                    <span className="dpcard-desc">Egg, chicken, mutton &amp; fish — varied across 7 days</span>
                                </button>

                                <button
                                    className="diet-pref-card mix"
                                    onClick={() => generateDiet("mix")}
                                >
                                    <span className="dpcard-icon">🥗</span>
                                    <span className="dpcard-label">Mix (Flexitarian)</span>
                                    <span className="dpcard-desc">50% veg + 50% non-veg — best of both worlds</span>
                                </button>

                                <button
                                    className="diet-pref-card vegan"
                                    onClick={() => generateDiet("vegan")}
                                >
                                    <span className="dpcard-icon">🌱</span>
                                    <span className="dpcard-label">Vegan</span>
                                    <span className="dpcard-desc">No dairy, no egg, no honey — 100% plant-based only</span>
                                </button>
                            </div>

                            <p className="diet-pref-note">
                                💡 This sets the food profile for your AI-generated 7-day meal plan.
                            </p>
                        </div>
                    </div>
                )
            }

            {/* ── Custom Lock Alert Modal ──────────────────────────── */}
            {
                lockAlert && (
                    <div className="lock-alert-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div className="lock-alert-modal" style={{
                            background: 'white', borderRadius: '12px', padding: '1.5rem',
                            width: '90%', maxWidth: '400px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            animation: 'ac-fade-up 0.2s ease-out', borderLeft: '4px solid #f59e0b'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>🔒</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Meal Locked</h3>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.4 }}>
                                        {lockAlert.replace("⚠️", "").trim()}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setLockAlert("")}
                                    style={{
                                        padding: '0.5rem 1.25rem', border: 'none', background: '#f59e0b',
                                        color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

