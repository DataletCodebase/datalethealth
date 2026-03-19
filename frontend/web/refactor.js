const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/DashboardPages.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add imports
content = content.replace(
    'import { useLanguage } from "../App";',
    `import { useLanguage } from "../App";\nimport Sidebar from "./dashboard/Sidebar";\nimport ContentHeader from "./dashboard/ContentHeader";\nimport DashboardGrid from "./dashboard/DashboardGrid";`
);

// Remove LabBadge
const labBadgeRegex = /function LabBadge\(\{[^}]+\}[^\n]*\n(?:.*?\n){1,35}?^\s*\}/m;
// Let's use string manipulation with indexOf instead of regex to be safe
const labBadgeStart = content.indexOf('function LabBadge({ label, value, normalRange, unit }) {');
if (labBadgeStart !== -1) {
    // Find the end of LabBadge
    const labBadgeEndStr = '    }\n\n\n\n    const todayTotal';
    const labBadgeEndIndex = content.indexOf(labBadgeEndStr, labBadgeStart);
    if (labBadgeEndIndex !== -1) {
        content = content.substring(0, labBadgeStart) + content.substring(labBadgeEndIndex + 4);
    }
}

// Replace return (...)
const returnStartStr = '        <div className="dashboard-content">';
const returnStart = content.indexOf(returnStartStr);
const returnEndStr = '    );\n}';
const returnEnd = content.lastIndexOf(returnEndStr);

if (returnStart !== -1 && returnEnd !== -1) {
    const newReturn = `        <div className="dashboard-content">
            <Sidebar 
                patients={patients}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
                conditionMap={conditionMap}
                currentPlan={currentPlan}
                setShowPricing={setShowPricing}
                setActiveTab={setActiveTab}
            />

            <main className="main-content">
                <ContentHeader 
                    selectedPatient={selectedPatient}
                    conditionMap={conditionMap}
                    toggleDomain={toggleDomain}
                    loading={loading}
                    activeLabs={activeLabs}
                    lab={lab}
                />

                <DashboardGrid 
                    question={question}
                    setQuestion={setQuestion}
                    language={language}
                    setLanguage={setLanguage}
                    loading={loading}
                    handleAsk={handleAsk}
                    setAiResponse={setAiResponse}
                    errorMsg={errorMsg}
                    aiResponse={aiResponse}
                    todayTotal={todayTotal}
                    handleWaterIntake={handleWaterIntake}
                    waterLogs={waterLogs}
                />

                <footer className="dashboard-footer">
                    <p>{t('copyright')}</p>
                </footer>
            </main>
        </div>\n`;
    content = content.substring(0, returnStart) + newReturn + content.substring(returnEnd);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated DashboardPages.jsx');
