import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup.jsx";
import ChatHistory from "./pages/ChatHistory";
import "./styles/App.css";
// import Navbar, { LanguageProvider } from "./pages/navbar.jsx";
import Navbar from "./pages/navbar.jsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import DashboardTab from "./pages/DashboardPages.jsx";
import Patients from "./pages/Patients.jsx";
import ActivityCenter from "./pages/ActivityCenter.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";



const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', color: '#94a3b8'
    }}>
      <div>Loading DatalethealthcareTM Dashboard...</div>
    </div>
  );
};

// API base
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : "/api";

// Helper: post with fallback across multiple urls
async function postJsonWithFallback(urls = [], payload = {}, options = {}) {
  const timeoutMs = options.timeoutMs || 12000;
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

function AppContent() {

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dashboardActiveTab") || "dashboard";
  });
  const [conditionMap, setConditionMap] = useState({ 1: ["kidney"] });
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("premium");

  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);

  // 🔹 AUTO-CACHE CLEARING (Force update when server version changes)
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const serverVer = data.version;
        const localVer = localStorage.getItem("app_version");

        if (localVer && serverVer && String(localVer) !== String(serverVer)) {
            console.log("🚀 New version detected! Clearing cache and reloading...");
            localStorage.setItem("app_version", serverVer);
            if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(n => caches.delete(n)));
            }
            window.location.reload(true);
        } else if (!localVer && serverVer) {
            localStorage.setItem("app_version", serverVer);
        }
      } catch (e) { /* ignore silent failure */ }
    };
    checkVersion();
    const timer = setInterval(checkVersion, 1000 * 60 * 5); // Check every 5 mins
    return () => clearInterval(timer);
  }, []);


  const calculateAge = (dob) => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile/basic", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Profile fetch failed");

        const data = await res.json();

        console.log("DOB from backend:", data.dob);
        console.log("Parsed DOB:", new Date(data.dob));

        const userAsPatient = {
          id: data.id || "me",
          name: data.full_name,
          diagnosis: data.disease || "—",
          age: calculateAge(data.dob)
        };

        setPatients([userAsPatient]);
        setSelectedPatient(userAsPatient);
        setIsInitialized(true);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
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
        timeoutMs: 12000,
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });

      if (!resultWrap.ok) {
        console.error("All ask endpoints failed");
        setErrorMsg("Failed to get response");
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
      setErrorMsg("Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentConditionContext = () => {
    if (!selectedPatient) return [];
    return conditionMap[selectedPatient.id] || [];
  };


  const handleConditionChange = useCallback((newCtx) => {
    if (!selectedPatient) return;
    setConditionMap(prev => {
      const oldCtx = prev[selectedPatient.id] || [];
      const oldStr = [...oldCtx].sort().join(",");
      const newStr = [...newCtx].sort().join(",");
      if (oldStr === newStr) return prev;
      return { ...prev, [selectedPatient.id]: newCtx };
    });
  }, [selectedPatient]);


  if (!isInitialized) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">


      <ChatWidget
        onSubmitted={async (payload) => {
          try {
            const base = API_BASE.replace(/\/$/, "");
            const urls = [`${base}/leads/`, `${base}/leads`];
            await postJsonWithFallback(urls, payload, { timeoutMs: 8000 });
          } catch (err) { /* ignore */ }
        }}
        defaultConditionContext={getCurrentConditionContext()}
        onConditionChange={handleConditionChange}
      />



      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />


      {activeTab === "dashboard" && (
        <DashboardTab />
      )}


      {activeTab === "patients" && (
        <Patients activeTab={activeTab} />
      )}

      {activeTab === "activity" && (
        <ActivityCenter />
      )}
    </div>
  );
}

function Dashboard() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/patients/:id/history" element={<ChatHistory />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}