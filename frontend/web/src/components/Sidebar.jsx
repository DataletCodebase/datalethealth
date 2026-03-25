import React, { createContext, useContext, useState, useEffect } from "react";
import AutoText from "../components/AutoText";
import { SleepWellnessWidget } from "../components/DashboardGrid";

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
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { setIsInitialized(true); return; }

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile/basic", {
                    headers: { Authorization: `Bearer ${token}` },
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

export default function Sidebar({ activeTab, setActiveTab }) {
    const { currentPlan, setShowPricing } = useSidebar();

    return (
        <div className="sidebar">
            {/* Current Plan Card */}
            <div className="pricing-sidebar-card">
                <div className="pricing-sidebar-header">
                    <h3><AutoText>Current Plan</AutoText></h3>
                    <span className="plan-badge" style={{
                        background: currentPlan === "premium"
                            ? "linear-gradient(135deg, #10B981, #10B98180)"
                            : currentPlan === "pro"
                                ? "linear-gradient(135deg, #8B5CF6, #8B5CF680)"
                                : "linear-gradient(135deg, #3B82F6, #3B82F680)",
                    }}>
                        {currentPlan.toUpperCase()}
                    </span>
                </div>
                <div className="pricing-sidebar-info">
                    <div className="plan-price">
                        <span className="price">
                            {currentPlan === "basic" ? "₹6500" : currentPlan === "premium" ? "₹7500" : "₹10000"}
                        </span>
                        <span className="period">/6<AutoText>month</AutoText></span>
                    </div>
                    <p className="plan-desc">
                        {currentPlan === "basic"
                            ? "Basic AI Support + 500 Chats"
                            : currentPlan === "premium"
                                ? <AutoText>Unlimited Everything</AutoText>
                                : "Pro Features + 24/7 Support"}
                    </p>
                    <button className="upgrade-btn" onClick={() => { setShowPricing(true); setActiveTab("pricing"); }}>
                        <AutoText>Upgrade Now</AutoText>
                    </button>
                </div>
            </div>

            {/* ── Wellness Widget ── */}
            <div style={{ marginTop: 14 }}>
                <SleepWellnessWidget />
            </div>
        </div>
    );
}
