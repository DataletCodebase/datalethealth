import React, { createContext, useContext, useState, useEffect } from "react";
// import { useLanguage } from "../pages/navbar.jsx";
import AutoText from "../components/AutoText";

export const SidebarContext = createContext();

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within SidebarProvider");
    return context;
};

export const SidebarProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [conditionMap, setConditionMap] = useState({ 1: ["kidney"] });
    const [currentPlan, setCurrentPlan] = useState("premium");
    const [showPricing, setShowPricing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

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
        if (!token) {
            setIsInitialized(true);
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile/basic", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Profile fetch failed");
                const data = await res.json();

                const userAsPatient = {
                    id: data.id || "me",
                    name: data.full_name,
                    diagnosis: data.disease || "—",
                    age: calculateAge(data.dob)
                };

                setPatients([userAsPatient]);
                setSelectedPatient(userAsPatient);
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setIsInitialized(true);
            }
        };

        fetchProfile();
    }, []);

    return (
        <SidebarContext.Provider value={{
            patients, setPatients,
            selectedPatient, setSelectedPatient,
            conditionMap, setConditionMap,
            currentPlan, setCurrentPlan,
            showPricing, setShowPricing,
            isInitialized
        }}>
            {children}
        </SidebarContext.Provider>
    );
};

export default function Sidebar({
    activeTab,
    setActiveTab
}) {
    // const { t } = useLanguage();
    const {
        patients,
        selectedPatient,
        setSelectedPatient,
        conditionMap,
        currentPlan,
        setShowPricing
    } = useSidebar();

    return (
        <div className="sidebar">
            {/* <h2 className="sidebar-title">{t("patientsTitle")}</h2> */}
            <h2 className="sidebar-title">
                <AutoText>Patients Title</AutoText>
            </h2>

            <div className="pricing-sidebar-card">
                <div className="pricing-sidebar-header">
                    {/* <h3>{t("currentPlan")}</h3> */}
                    <h3>
                        <AutoText>Current Plan</AutoText>
                    </h3>
                    <span
                        className="plan-badge"
                        style={{
                            background:
                                currentPlan === "premium"
                                    ? "linear-gradient(135deg, #10B981, #10B98180)"
                                    : currentPlan === "pro"
                                        ? "linear-gradient(135deg, #8B5CF6, #8B5CF680)"
                                        : "linear-gradient(135deg, #3B82F6, #3B82F680)",
                        }}
                    >
                        {currentPlan.toUpperCase()}
                    </span>
                </div>
                <div className="pricing-sidebar-info">
                    <div className="plan-price">
                        <span className="price">
                            {currentPlan === "basic"
                                ? "₹6500"
                                : currentPlan === "premium"
                                    ? "₹7500"
                                    : "₹10000"}
                        </span>
                        {/* <span className="period">/6month</span> */}
                        <span className="period">
                            /6<AutoText>month</AutoText>
                        </span>
                    </div>
                    <p className="plan-desc">
                        {currentPlan === "basic"
                            ? "Basic AI Support + 500 Chats"
                            : currentPlan === "premium"
                                ? <AutoText>Unlimited Everything</AutoText>
                                : "Pro Features + 24/7 Support"}
                    </p>
                    <button
                        className="upgrade-btn"
                        onClick={() => {
                            setShowPricing(true);
                            setActiveTab("pricing");
                        }}
                    >
                        {/* {t("upgradeNow")} */}
                        <AutoText>Upgrade Now</AutoText>
                    </button>
                </div>
            </div>

            <div className="patient-list">
                {patients.map((p) => (
                    <div
                        key={p.id}
                        className={`patient-card ${selectedPatient && selectedPatient.id === p.id ? "active" : ""
                            }`}
                        onClick={() => setSelectedPatient(p)}
                    >
                        <div className="patient-info">
                            <div className="patient-name">  <AutoText>{p.name}</AutoText></div>
                            <div className="patient-diagnosis">{p.diagnosis || "—"}</div>
                            <div className="patient-conditions">
                                {(conditionMap[p.id] || []).map((d) => (
                                    <span key={d} className="condition-tag">
                                        {/* {t(d)} */}
                                        <AutoText>{d}</AutoText>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="patient-age">
                            {/* {p.age !== null ? `${p.age} ${<AutoText>years</AutoText>}` : `— ${<AutoText>years</AutoText>}`} */}
                            {p.age !== null ? (
                                <>
                                    {p.age} <AutoText>years</AutoText>
                                </>
                            ) : (
                                <>
                                    — <AutoText>years</AutoText>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
