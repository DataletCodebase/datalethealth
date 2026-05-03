import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
// import { useLanguage } from "./navbar";
// import Sidebar, { SidebarProvider, useSidebar } from "./dashboard/Sidebar";
import Sidebar, { SidebarProvider, useSidebar } from "../components/Sidebar";
import ContentHeader, { ContentHeaderRight } from "../components/ContentHeader";
import { AskHealthAgent, ActivityWidget } from "../components/DashboardGrid";
// import ContentHeader, { ContentHeaderRight } from "./dashboard/ContentHeader";
// import { AskHealthAgent, WaterTracker } from "./dashboard/DashboardGrid";
import { useLanguage } from "../contexts/LanguageContext";

import AutoText from "../components/AutoText";


import { Link, useLocation, useNavigate } from "react-router-dom";


import { API_BASE } from "../apiConfig";

// Helper: post with fallback across multiple urls
async function postJsonWithFallback(urls = [], payload = {}, options = {}) {
    const timeoutMs = options.timeoutMs || 45000;
    for (const u of urls) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);

            const res = await fetch(u, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(id);

            if (!res.ok) {
                let text = "";
                try { text = await res.text(); } catch { }
                console.warn(`POST ${u} returned ${res.status}`, text);
                continue;
            }

            const json = await res.json().catch(async () => {
                const txt = await res.text().catch(() => null);
                return txt;
            });
            return { url: u, ok: true, body: json };
        } catch (err) {
            if (err.name === "AbortError") {
                console.warn(`POST ${u} timed out after ${timeoutMs}ms`);
            } else {
                console.warn(`POST ${u} failed:`, err && err.message ? err.message : err);
            }
            continue;
        }
    }
    return { ok: false };
}



function DashboardContent() {

    const { selectedPatient, conditionMap, setConditionMap, isInitialized } = useSidebar();

    const [lab, setLab] = useState(null);
    const [question, setQuestion] = useState("");
    const [aiResponse, setAiResponse] = useState(null);
    const [waterLogs, setWaterLogs] = useState([
        { id: 1, timestamp: new Date().toISOString(), volume_ml: 200 },
        { id: 2, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), volume_ml: 300 }
    ]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");

    const { language, setLanguage, t } = useLanguage();
    const { logout } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    useEffect(() => {
        if (location.pathname === "/privacy-policy") {
            setShowPrivacyModal(true);
        } else {
            setShowPrivacyModal(false);
        }
    }, [location.pathname]);

    const closePrivacyModal = () => {
        setShowPrivacyModal(false);
        if (location.pathname === "/privacy-policy") {
            navigate("/dashboard");
        }
    };


    // useEffect(() => {
    //     document.title = t('dataletHealthcareDashboard');
    // }, [language, t]);
    useEffect(() => {
        document.title = "Datalet Healthcare Dashboard";
    }, []);




    const handleAsk = async (e) => {
        e?.preventDefault();
        setErrorMsg(null);

        if (!selectedPatient || !question.trim()) return;

        setLoading(true);
        setAiResponse(null);

        try {
            const payload = {
                question: question.trim(),
                language,
                patient_id: selectedPatient.id,
                condition_context: getCurrentConditionContext()
            };

            const base = API_BASE.replace(/\/$/, "");
            const endpoints = [
                `${base}/ask-agent/ask/`,
                `${base}/ask/`,
                `${base}/ask`
            ];

            const token = localStorage.getItem("token");
            const resultWrap = await postJsonWithFallback(endpoints, payload, {
                timeoutMs: 45000,
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });

            if (!resultWrap.ok) {
                console.error("All ask endpoints failed");
                setErrorMsg(t('failedResponse'));
                return;
            }

            const result = resultWrap.body;
            if (result === null || result === undefined) throw new Error("Empty response");

            let nutrition_summary = null;
            let ai_source = result.ai_source || result.source || result.aiSource || "internal";
            let clinical_classification = result.clinical_classification || result.classification || result.status || null;
            let clinical_reasoning = result.clinical_reasoning || result.reason || result.nutrient_reason || null;
            let ai_raw = result.ai_raw || result.raw || result._raw || null;
            let water_context = result.water_context || result.waterContext || null;
            let condition_context = result.condition_context || result.context || result.conditionContext || [];

            if (typeof result === "string") {
                nutrition_summary = result;
            } else if (result.nutrition_summary && typeof result.nutrition_summary === "string") {
                nutrition_summary = result.nutrition_summary;
            } else if (result.answer && typeof result.answer === "string") {
                nutrition_summary = result.answer;
            } else if (result.summary && typeof result.summary === "string") {
                nutrition_summary = result.summary;
            } else if (result.data && typeof result.data === "object" && result.data.nutrition_summary) {
                nutrition_summary = result.data.nutrition_summary;
                ai_raw = ai_raw || result.data;
            } else if (Array.isArray(result.choices) && result.choices[0]) {
                const c = result.choices[0];
                nutrition_summary = c.text || (c.message && (c.message.content || c.message)) || JSON.stringify(c);
                ai_source = result.model || ai_source;
            } else if (result.reply && typeof result.reply === "string") {
                nutrition_summary = result.reply;
            } else if (result.ai_raw && result.nutrition_summary) {
                nutrition_summary = result.nutrition_summary;
            } else {
                try {
                    const s = JSON.stringify(result);
                    nutrition_summary = s.length > 1000 ? s.slice(0, 1000) + "..." : s;
                } catch (err) {
                    nutrition_summary = "Received an unexpected response shape from the server.";
                }
            }

            setAiResponse({
                nutrition_summary,
                ai_source,
                clinical_classification,
                clinical_reasoning,
                ai_raw,
                water_context,
                condition_context,
                raw_response: result
            });

        } catch (err) {
            console.error("handleAsk error:", err);
            setErrorMsg(t('failedResponse'));
        } finally {
            setLoading(false);
        }
    };

    // new update made from ai for camera in ask agent

    const handlePhotoUpload = async (file) => {
        if (!selectedPatient || !file) return;

        setErrorMsg(null);
        setLoading(true);
        setAiResponse(null);

        try {
            const formData = new FormData();
            formData.append("patient_id", selectedPatient.id);
            formData.append("photo", file);

            const conditionCtx = getCurrentConditionContext();
            if (conditionCtx && conditionCtx.length > 0) {
                formData.append("condition_context", conditionCtx.join(","));
            }

            const token = localStorage.getItem("token");
            const base = API_BASE.replace(/\/$/, "");

            const res = await fetch(`${base}/ask/analyze-food-photo`, {
                method: "POST",
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
                body: formData
            });

            if (!res.ok) {
                let text = "";
                try { text = await res.text(); } catch { }
                console.error("Photo upload failed", res.status, text);
                setErrorMsg(t('failedResponse') || "Photo analysis failed.");
                setLoading(false);
                return;
            }

            const result = await res.json();

            setAiResponse({
                nutrition_summary: result.nutrition_summary,
                ai_source: "vision-ai",
                clinical_classification: result.clinical_classification,
                clinical_reasoning: result.clinical_reasoning,
                ai_raw: `Detected Food: ${result.food_name || 'Unknown'} (~${result.estimated_calories || 0} kcal)`,
                water_context: null,
                condition_context: conditionCtx,
                raw_response: result
            });

            if (result.food_name) {
                setQuestion(`Analyzing: ${result.food_name}`);
            }

        } catch (err) {
            console.error("handlePhotoUpload error:", err);
            setErrorMsg(t('failedResponse') || "Photo analysis failed.");
        } finally {
            setLoading(false);
        }
    };


    // Ended here   07/03/2026 12:15 AM


    const getCurrentConditionContext = () => {
        if (!selectedPatient) return [];
        return conditionMap[selectedPatient.id] || [];
    };

    const toggleDomain = (domainId) => {
        if (!selectedPatient) return;

        setConditionMap(prev => {
            const currentConditions = prev[selectedPatient.id] || [];
            const conditionSet = new Set(currentConditions);

            if (conditionSet.has(domainId)) {
                conditionSet.delete(domainId);
            } else {
                conditionSet.add(domainId);
            }

            const updatedConditions = Array.from(conditionSet);

            if (window.dispatchEvent) {
                const event = new CustomEvent("updateConditionContext", { detail: updatedConditions });
                window.dispatchEvent(event);
            }

            return {
                ...prev,
                [selectedPatient.id]: updatedConditions
            };
        });
    };

    const saveWaterLog = async (log) => {
        try {
            const base = API_BASE.replace(/\/$/, "");
            const urls = [`${base}/water-logs/`, `${base}/water-logs`];
            await postJsonWithFallback(urls, log, { timeoutMs: 8000 });
        } catch (err) { /* ignore */ }
    };

    const handleWaterIntake = (amount) => {
        if (!selectedPatient) return;
        const newLog = { id: Date.now(), timestamp: new Date().toISOString(), volume_ml: amount, patient_id: selectedPatient.id };
        setWaterLogs(prev => [...prev, newLog]);
        saveWaterLog(newLog).catch(() => { });
        setQuestion(`Can I have ${amount} ml of water now?`);
        setTimeout(() => {
            handleAsk({ preventDefault: () => { } });
        }, 150);
    };

    const todayTotal = waterLogs.reduce((acc, v) => {
        const d = new Date(v.timestamp).toLocaleDateString();
        const today = new Date().toLocaleDateString();
        return d === today ? acc + (v.volume_ml || 0) : acc;
    }, 0);

    const handleConditionChange = useCallback((newCtx) => {
        if (!selectedPatient) return;
        setConditionMap(prev => {
            const oldCtx = prev[selectedPatient.id] || [];
            if (JSON.stringify(oldCtx) === JSON.stringify(newCtx)) return prev;
            return { ...prev, [selectedPatient.id]: newCtx };
        });
    }, [selectedPatient]);


    // const LAB_DEFINITIONS = {
    //     kidney: [
    //         { id: 'creatinine', label: t('creatinine'), type: 'number', unit: 'mg/dL', normalRange: '0.6-1.3' },
    //         { id: 'potassium', label: t('potassium'), type: 'number', unit: 'mmol/L', normalRange: '3.5-5.1' },
    //         { id: 'sodium', label: t('sodium'), type: 'number', unit: 'mmol/L', normalRange: '135-145' },
    //         { id: 'urea', label: t('urea'), type: 'number', unit: 'mg/dL', normalRange: '7-20' },
    //         { id: 'estimatedGFR', label: t('estimatedGFR'), type: 'number', unit: 'mL/min/1.73m²', normalRange: '>60' },
    //         { id: 'albumin', label: t('albumin'), type: 'number', unit: 'g/dL', normalRange: '3.4-5.4' },
    //         { id: 'calcium', label: t('calcium'), type: 'number', unit: 'mg/dL', normalRange: '8.5-10.2' },
    //         { id: 'phosphate', label: t('phosphate'), type: 'number', unit: 'mg/dL', normalRange: '2.5-4.5' },
    //         { id: 'uricAcid', label: t('uricAcid'), type: 'number', unit: 'mg/dL', normalRange: '3.4-7.0' }
    //     ],
    //     heart: [
    //         { id: 'cholesterolTotal', label: t('cholesterolTotal'), type: 'number', unit: 'mg/dL', normalRange: '<200' },
    //         { id: 'cholesterolLDL', label: t('cholesterolLDL'), type: 'number', unit: 'mg/dL', normalRange: '<100' },
    //         { id: 'cholesterolHDL', label: t('cholesterolHDL'), type: 'number', unit: 'mg/dL', normalRange: '>40' },
    //         { id: 'triglycerides', label: t('triglycerides'), type: 'number', unit: 'mg/dL', normalRange: '<150' },
    //         { id: 'bloodPressureSystolic', label: t('systolic'), type: 'number', unit: 'mmHg', normalRange: '<120' },
    //         { id: 'bloodPressureDiastolic', label: t('diastolic'), type: 'number', unit: 'mmHg', normalRange: '<80' },
    //         { id: 'heartRate', label: t('heartRate'), type: 'number', unit: 'bpm', normalRange: '60-100' },
    //         { id: 'bmi', label: t('bmi'), type: 'number', unit: 'kg/m²', normalRange: '18.5-24.9' }
    //     ],
    //     diabetes: [
    //         { id: 'fastingGlucose', label: t('fastingGlucose'), type: 'number', unit: 'mg/dL', normalRange: '70-100' },
    //         { id: 'postprandialGlucose', label: t('postprandialGlucose'), type: 'number', unit: 'mg/dL', normalRange: '<140' },
    //         { id: 'hba1c', label: t('hba1c'), type: 'number', unit: '%', normalRange: '<5.7' },
    //         { id: 'cholesterolTotal', label: t('cholesterolTotal'), type: 'number', unit: 'mg/dL', normalRange: '<200' },
    //         { id: 'triglycerides', label: t('triglycerides'), type: 'number', unit: 'mg/dL', normalRange: '<150' },
    //         { id: 'bmi', label: t('bmi'), type: 'number', unit: 'kg/m²', normalRange: '18.5-24.9' },
    //         { id: 'bloodPressureSystolic', label: t('systolic'), type: 'number', unit: 'mmHg', normalRange: '<120' },
    //         { id: 'bloodPressureDiastolic', label: t('diastolic'), type: 'number', unit: 'mmHg', normalRange: '<80' }
    //     ],
    //     normalAdult: [
    //         { id: 'bloodPressureSystolic', label: t('systolic'), type: 'number', unit: 'mmHg', normalRange: '<120' },
    //         { id: 'bloodPressureDiastolic', label: t('diastolic'), type: 'number', unit: 'mmHg', normalRange: '<80' },
    //         { id: 'heartRate', label: t('heartRate'), type: 'number', unit: 'bpm', normalRange: '60-100' },
    //         { id: 'bmi', label: t('bmi'), type: 'number', unit: 'kg/m²', normalRange: '18.5-24.9' },
    //         { id: 'cholesterolTotal', label: t('cholesterolTotal'), type: 'number', unit: 'mg/dL', normalRange: '<200' },
    //         { id: 'fastingGlucose', label: t('fastingGlucose'), type: 'number', unit: 'mg/dL', normalRange: '70-100' },
    //         { id: 'creatinine', label: t('creatinine'), type: 'number', unit: 'mg/dL', normalRange: '0.6-1.3' }
    //     ]
    // };


    const LAB_DEFINITIONS = {
        kidney: [
            {
                id: "creatinine",
                label: "Creatinine",
                type: "number",
                unit: "mg/dL",
                normalRange: "0.6-1.3",
            },
            {
                id: "potassium",
                label: "Potassium",
                type: "number",
                unit: "mmol/L",
                normalRange: "3.5-5.1",
            },
            {
                id: "sodium",
                label: "Sodium",
                type: "number",
                unit: "mmol/L",
                normalRange: "135-145",
            },
            {
                id: "urea",
                label: "Urea",
                type: "number",
                unit: "mg/dL",
                normalRange: "7-20",
            },
            {
                id: "estimatedGFR",
                label: "Estimated GFR",
                type: "number",
                unit: "mL/min/1.73m²",
                normalRange: ">60",
            },
            {
                id: "albumin",
                label: "Albumin",
                type: "number",
                unit: "g/dL",
                normalRange: "3.4-5.4",
            },
            {
                id: "calcium",
                label: "Calcium",
                type: "number",
                unit: "mg/dL",
                normalRange: "8.5-10.2",
            },
            {
                id: "phosphate",
                label: "Phosphate",
                type: "number",
                unit: "mg/dL",
                normalRange: "2.5-4.5",
            },
            {
                id: "uricAcid",
                label: "Uric Acid",
                type: "number",
                unit: "mg/dL",
                normalRange: "3.4-7.0",
            },
        ],

        heart: [
            {
                id: "cholesterolTotal",
                label: "Total Cholesterol",
                type: "number",
                unit: "mg/dL",
                normalRange: "<200",
            },
            {
                id: "cholesterolLDL",
                label: "LDL Cholesterol",
                type: "number",
                unit: "mg/dL",
                normalRange: "<100",
            },
            {
                id: "cholesterolHDL",
                label: "HDL Cholesterol",
                type: "number",
                unit: "mg/dL",
                normalRange: ">40",
            },
            {
                id: "triglycerides",
                label: "Triglycerides",
                type: "number",
                unit: "mg/dL",
                normalRange: "<150",
            },
            {
                id: "bloodPressureSystolic",
                label: "Systolic Blood Pressure",
                type: "number",
                unit: "mmHg",
                normalRange: "<120",
            },
            {
                id: "bloodPressureDiastolic",
                label: "Diastolic Blood Pressure",
                type: "number",
                unit: "mmHg",
                normalRange: "<80",
            },
            {
                id: "heartRate",
                label: "Heart Rate",
                type: "number",
                unit: "bpm",
                normalRange: "60-100",
            },
            {
                id: "bmi",
                label: "BMI",
                type: "number",
                unit: "kg/m²",
                normalRange: "18.5-24.9",
            },
        ],

        diabetes: [
            {
                id: "fastingGlucose",
                label: "Fasting Glucose",
                type: "number",
                unit: "mg/dL",
                normalRange: "70-100",
            },
            {
                id: "postprandialGlucose",
                label: "Postprandial Glucose",
                type: "number",
                unit: "mg/dL",
                normalRange: "<140",
            },
            {
                id: "hba1c",
                label: "HbA1c",
                type: "number",
                unit: "%",
                normalRange: "<5.7",
            },
            {
                id: "cholesterolTotal",
                label: "Total Cholesterol",
                type: "number",
                unit: "mg/dL",
                normalRange: "<200",
            },
            {
                id: "triglycerides",
                label: "Triglycerides",
                type: "number",
                unit: "mg/dL",
                normalRange: "<150",
            },
            {
                id: "bmi",
                label: "BMI",
                type: "number",
                unit: "kg/m²",
                normalRange: "18.5-24.9",
            },
            {
                id: "bloodPressureSystolic",
                label: "Systolic Blood Pressure",
                type: "number",
                unit: "mmHg",
                normalRange: "<120",
            },
            {
                id: "bloodPressureDiastolic",
                label: "Diastolic Blood Pressure",
                type: "number",
                unit: "mmHg",
                normalRange: "<80",
            },
        ],

        normalAdult: [{ id: "bloodPressureSystolic", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", normalRange: "<120", },
        {
            id: "bloodPressureDiastolic",
            label: "Diastolic Blood Pressure",
            type: "number",
            unit: "mmHg",
            normalRange: "<80",
        },
        {
            id: "heartRate",
            label: "Heart Rate",
            type: "number",
            unit: "bpm",
            normalRange: "60-100",
        },
        {
            id: "bmi",
            label: "BMI",
            type: "number",
            unit: "kg/m²",
            normalRange: "18.5-24.9",
        },
        {
            id: "cholesterolTotal",
            label: "Total Cholesterol",
            type: "number",
            unit: "mg/dL",
            normalRange: "<200",
        },
        {
            id: "fastingGlucose",
            label: "Fasting Glucose",
            type: "number",
            unit: "mg/dL",
            normalRange: "70-100",
        },
        {
            id: "creatinine",
            label: "Creatinine",
            type: "number",
            unit: "mg/dL",
            normalRange: "0.6-1.3",
        },
        ],
    };


    const activeDomains = conditionMap[selectedPatient?.id] || [];

    const activeLabs = React.useMemo(() => {
        if (!activeDomains.length) return [];

        const mergedFields = activeDomains.flatMap(
            domain => LAB_DEFINITIONS[domain.toLowerCase()] || []
        );

        // Remove duplicates (same lab appearing in multiple conditions)
        return Array.from(
            new Map(mergedFields.map(field => [field.id, field])).values()
        );
    }, [activeDomains]);



    useEffect(() => {
        const fetchMedicalData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("/api/medical/data", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch medical data");

                const data = await res.json();
                console.log("[DEBUG] Fetched Medical Data:", data);
                setLab(data);
            } catch (err) {
                console.error("Medical fetch error:", err);
                setLab({});
            } finally {
                setLoading(false);
            }
        };

        fetchMedicalData();
    }, []);

    if (!isInitialized) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100vh', color: '#94a3b8'
            }}>
                {/* <div>{t('loading')}</div> */}
                <AutoText>Loading</AutoText>
            </div>
        );
    }

    return (

        <div className="dashboard-content">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <main className="main-content">
                <div className="dashboard-two-column-layout">

                    {/* LEFT COLUMN */}
                    <div className="dashboard-left-column">
                        <ContentHeader
                            selectedPatient={selectedPatient}
                            conditionMap={conditionMap}
                            toggleDomain={toggleDomain}
                            loading={loading}
                            activeLabs={activeLabs}
                            lab={lab}
                        />

                        <AskHealthAgent
                            question={question}
                            setQuestion={setQuestion}
                            language={language}
                            setLanguage={setLanguage}
                            loading={loading}
                            handleAsk={handleAsk}
                            handlePhotoUpload={handlePhotoUpload}
                            setAiResponse={setAiResponse}
                            errorMsg={errorMsg}
                            aiResponse={aiResponse}
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="dashboard-right-column">
                        <ContentHeaderRight
                            selectedPatient={selectedPatient}
                            loading={loading}
                            activeLabs={activeLabs}
                            lab={lab}
                        />

                        <ActivityWidget />

                    </div>
                </div>

                <footer className="dashboard-footer">
                    {/* <p>{t('copyright')}</p> */}
                    <p>
                        <AutoText>© 2026 Datalet Healthcare. All rights reserved.</AutoText>
                        <span style={{ margin: "0 8px", opacity: 0.5 }}>|</span>
                        <Link to="/privacy-policy" className="privacy-link">Privacy Policy</Link>
                    </p>
                </footer>

            </main>

            {showPrivacyModal && (
                <div className="privacy-overlay" onClick={closePrivacyModal}>
                    <div className="privacy-card" onClick={(e) => e.stopPropagation()}>
                        <div className="privacy-header">
                            <h2>Privacy Policy</h2>
                            <button className="privacy-close" onClick={closePrivacyModal}>&times;</button>
                        </div>
                        <div className="privacy-body">
                            <iframe 
                                src="/privacy-policy.html" 
                                className="privacy-iframe"
                                title="Privacy Policy"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DashboardTab() {
    return (
        <SidebarProvider>
            <DashboardContent />
        </SidebarProvider>
    );
}
