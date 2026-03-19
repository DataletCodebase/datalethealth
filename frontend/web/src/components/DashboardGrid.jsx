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

export function WaterTracker({ todayTotal, handleWaterIntake, waterLogs }) {
    // const { t } = useLanguage();

    return (
        <div className="panel water-tracker">
            {/* <h3>{t("waterIntake")}</h3> */}
            <h3>
                <AutoText>Water Intake</AutoText>
            </h3>

            <div className="water-summary">
                <div className="water-today">
                    {/* <span className="water-label">{t("today")}</span> */}
                    <span className="water-label">
                        <AutoText>Today</AutoText>
                    </span>
                    {/* <span className="water-amount">{todayTotal} ml</span> */}
                    <span className="water-amount">
                        {todayTotal} <AutoText>ml</AutoText>
                    </span>
                </div>
                <div className="water-level-container">
                    <div
                        className="water-level-fill"
                        style={{
                            height: `${Math.min((todayTotal / 2000) * 100, 100)}%`,
                        }}
                    ></div>
                    {/* <div className="water-level-markers">
                        <span>2L</span>
                        <span>1.5L</span>
                        <span>1L</span>
                        <span>500ml</span>
                        <span>0</span>
                    </div> */}
                    <div className="water-level-markers">
                        <span>
                            2<AutoText>L</AutoText>
                        </span>
                        <span>
                            1.5<AutoText>L</AutoText>
                        </span>
                        <span>
                            1<AutoText>L</AutoText>
                        </span>
                        <span>
                            500<AutoText>ml</AutoText>
                        </span>
                        <span>0</span>
                    </div>
                </div>
            </div>

            <div className="water-actions">
                {/* <label>{t("quickAdd")}</label> */}
                <label>
                    <AutoText>Quick Add</AutoText>
                </label>
                <div className="water-buttons">
                    <button
                        onClick={() => handleWaterIntake(200)}
                        className="water-btn"
                    >
                        +200  <AutoText>ml</AutoText>
                    </button>
                    <button
                        onClick={() => handleWaterIntake(100)}
                        className="water-btn"
                    >
                        +100 <AutoText>ml</AutoText>
                    </button>
                </div>
            </div>

            <div className="recent-water-logs">
                {/* <h4>{t("recentIntake")}</h4> */}
                <h4>
                    <AutoText>Recent Intake</AutoText>
                </h4>
                <div className="water-log-list">
                    {waterLogs
                        .slice(-3)
                        .reverse()
                        .map((log) => (
                            <div key={log.id} className="water-log-item">
                                {/* <span className="log-time">
                                    {new Date(log.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span> */}
                                <span className="log-time">
                                    {(() => {
                                        const date = new Date(log.timestamp);
                                        const hours = date.getHours();
                                        const minutes = date
                                            .getMinutes()
                                            .toString()
                                            .padStart(2, "0");

                                        const hour12 = hours % 12 || 12;
                                        const period = hours >= 12 ? "PM" : "AM";

                                        return (
                                            <>
                                                {hour12}:{minutes} <AutoText>{period}</AutoText>
                                            </>
                                        );
                                    })()}
                                </span>
                                {/* <span className="log-amount">{log.volume_ml} ml</span> */}
                                <span className="log-amount">
                                    {log.volume_ml} <AutoText>ml</AutoText>
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
