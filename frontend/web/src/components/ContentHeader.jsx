import React from "react";
// import { useLanguage } from "../navbar";
// import { useLanguage } from "../pages/navbar.jsx";
import AutoText from "../components/AutoText";

function LabBadge({ label, value, normalRange, unit, }) {
    const parseRange = (rangeStr) => {
        if (!rangeStr || typeof rangeStr !== "string") return null;
        const parts = rangeStr.split("-").map(s => s.trim()).filter(Boolean);
        if (parts.length !== 2) return null;
        const min = Number(parts[0]);
        const max = Number(parts[1]);
        if (Number.isFinite(min) && Number.isFinite(max)) return [min, max];
        return null;
    };
    const numericValue = (value !== null && value !== undefined && value !== "") ? Number(value) : null;
    const parsedRange = parseRange(normalRange);
    let status = "normal";
    if (numericValue !== null && parsedRange) {
        const [min, max] = parsedRange;
        if (numericValue < min) status = "low";
        else if (numericValue > max) status = "high";
        else status = "normal";
    } else status = "normal";
    const statusColors = { normal: "#10B981", low: "#3B82F6", high: "#EF4444" };

    return (
        <div className="lab-badge" aria-live="polite" role="group" aria-label={`${label} lab`}>
            <div className="lab-label">
                {/* <span>{t(label.toLowerCase())}</span> */}
                <span><AutoText>{label.toLowerCase()}</AutoText></span>
                <div className="lab-status" style={{ backgroundColor: statusColors[status] }}><AutoText>{status}</AutoText></div>
            </div>
            <div className="lab-value">
                {numericValue !== null && !Number.isNaN(numericValue) ? numericValue : "—"} {unit && <span className="lab-unit"><AutoText>{unit}</AutoText></span>}
            </div>
            {normalRange && <div className="lab-range"><AutoText>Normal</AutoText>: {normalRange}</div>}
        </div>
    );
}

export default function ContentHeader({
    selectedPatient,
    conditionMap,
    toggleDomain
}) {
    // const { t } = useLanguage();

    return (
        <div className="content-header-left">
            <div className="header-info">
                {/* <h1>{t("patientDashboard")}</h1> */}
                <h1>
                    <AutoText>Patient Dashboard</AutoText>
                </h1>
                <p className="patient-selected">
                    {/* {t("patient")}: <span>{selectedPatient?.name ?? "—"}</span> */}
                    <AutoText>Patient</AutoText>:{" "}<span><AutoText>{selectedPatient?.name}</AutoText></span>
                </p>
                {selectedPatient && (
                    <div className="condition-selector">
                        {/* <span>{t("conditionContext")}:</span> */}
                        <span>
                            <AutoText>Condition Context</AutoText>:
                        </span>
                        {[
                            { id: "Kidney", label: "kidney", color: "#3B82F6" },
                            { id: "Heart", label: "heart", color: "#EF4444" },
                            { id: "Diabetes", label: "diabetes", color: "#10B981" },
                        ].map((d) => {
                            const active = (conditionMap[selectedPatient.id] || []).includes(d.id);
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => toggleDomain(d.id)}
                                    className={`condition-btn ${active ? "active" : ""}`}
                                    style={
                                        active
                                            ? {
                                                backgroundColor: `${d.color}22`,
                                                borderColor: d.color,
                                                transform: "scale(1.05)",
                                            }
                                            : {}
                                    }
                                >
                                    {/* {d.label} */}
                                    <AutoText>{d.label}</AutoText>
                                    {active && <span className="pulse-dot"></span>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
// export function ContentHeaderRight({ selectedPatient, activeLabs, lab, loading }) {
//     const { t } = useLanguage();

//     return (
//         <div className="lab-summary-card">
//             <div className="lab-summary-header">
//                 <h3>{t("latestLabs")}</h3>
//             </div>

//             {
//                 loading ? (
//                     <div className="lab-empty">
//                         <small>{t("loading")}</small>
//                     </div>
//                 ) : !selectedPatient ? (
//                     <div className="lab-empty">
//                         <small>{t("noPatient")}</small>
//                     </div>
//                 ) : !activeLabs.length ? (
//                     <div className="lab-empty">
//                         <small>{t("selectCondition")}</small>
//                     </div>
//                 ) : !lab || Object.values(lab).every((v) => v === null) ? (
//                     <div className="lab-empty">
//                         <small>{t("noData")}</small>
//                     </div>
//                 ) : (
//                     <div className="lab-scroll-container">
//                         <div className="lab-grid">
//                             {activeLabs
//                                 .filter((field) => lab[field.id] !== null)
//                                 .map((field) => (
//                                     <LabBadge
//                                         key={field.id}
//                                         label={field.label}
//                                         value={lab[field.id]}
//                                         normalRange={field.normalRange}
//                                         unit={field.unit}
//                                         t={t}
//                                     />
//                                 ))}
//                         </div>
//                     </div>
//                 )
//             }
//         </div>
//     );

export function ContentHeaderRight({
    selectedPatient,
    activeLabs,
    lab,
    loading,
}) {
    // Show all active labs for the selected condition
    const validFields = activeLabs || [];

    return (
        <div className="lab-summary-card">
            <div className="lab-summary-header">
                <h3>
                    <AutoText>Latest Labs</AutoText>
                </h3>
            </div>

            {loading ? (
                <div className="lab-empty">
                    <small>
                        <AutoText>Loading</AutoText>
                    </small>
                </div>
            ) : !selectedPatient ? (
                <div className="lab-empty">
                    <small>
                        <AutoText>No Patient Selected</AutoText>
                    </small>
                </div>
            ) : !activeLabs.length ? (
                <div className="lab-empty">
                    <small>
                        <AutoText>Select Condition</AutoText>
                    </small>
                </div>
            ) : validFields.length === 0 ? (
                <div className="lab-empty">
                    <small>
                        <AutoText>No Data Available</AutoText>
                    </small>
                </div>
            ) : (
                <div className="lab-scroll-container">
                    <div className="lab-grid">
                        {validFields.map((field) => {
                            const val = lab && lab[field.id] !== null && lab[field.id] !== undefined && lab[field.id] !== ""
                                ? lab[field.id]
                                : "-";
                            return (
                                <LabBadge
                                    key={field.id}
                                    label={field.label}
                                    value={val}
                                    normalRange={field.normalRange}
                                    unit={field.unit}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
