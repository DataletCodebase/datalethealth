import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import ChatWidget from "./components/ChatWidget";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup.jsx";
import ChatHistory from "./pages/ChatHistory";
import { useAuth } from "./hooks/useAuth";
import { useUser } from "./contexts/UserContext";

// Translation data - Updated with DatalethealthcareTM
const translations = {
  en: {
    dashboard: "Dashboard",
    patients: "Patients",
    dataletHealthcareDashboard: "DatalethealthcareTM Dashboard",
    patientsTitle: "Patients",
    patientDashboard: "Patient Dashboard",
    patient: "Patient",
    diagnosis: "Diagnosis",
    years: "yrs",
    latestLabs: "Latest Labs",
    creatinine: "Creatinine",
    potassium: "Potassium",
    sodium: "Sodium",
    urea: "Urea",
    normal: "Normal",
    low: "Low",
    high: "High",
    askTheAgent: "Ask the Health Agent",
    personalizedAdvice: "Get personalized nutrition and health advice",
    questionPlaceholder: "e.g. Can I drink 200 ml of milk today?",
    askButton: "Ask",
    clearButton: "Clear",
    askingButton: "Asking...",
    aiResponse: "AI Response",
    noResponse: "No response yet. Ask a question to get personalized advice.",
    source: "Source",
    context: "Context",
    waterIntake: "Water Intake",
    today: "Today",
    quickAdd: "Quick Add",
    recentIntake: "Recent Intake",
    conditionContext: "Condition context",
    kidney: "Kidney",
    heart: "Heart",
    diabetes: "Diabetes",
    copyright: "Copyright: Datalet Research Laboratory",
    loading: "Loading DatalethealthcareTM Dashboard...",
    noData: "No lab data available",
    failedResponse: "Failed to get response",
    pricing: "Pricing",
    choosePlan: "Choose Your Plan",
    monthly: "/6month",
    features: "Features",
    basicPlan: "Basic",
    premiumPlan: "Premium",
    proPlan: "Pro",
    mostPopular: "Most Popular",
    currentPlan: "Current Plan",
    upgradeNow: "Upgrade Now",
    getStarted: "Get Started",
    subscribe: "Subscribe",
    unlimited: "Unlimited",
    limited: "Limited",
    yes: "Yes",
    no: "No",
    included: "Included",
    notIncluded: "Not Included",
    account: "Account",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    notifications: "Notifications",
    help: "Help",
    admin: "Admin",
    viewProfile: "View Profile",
    editProfile: "Edit Profile",
    // New profile translations
    profileSection: "Profile Section",
    personalDetails: "Personal Details",
    profilePicture: "Profile Picture",
    uploadPhoto: "Upload Photo",
    changePhoto: "Change Photo",
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    height: "Height (cm)",
    weight: "Weight (kg)",
    bloodGroup: "Blood Group",
    address: "Address",
    city: "City",
    state: "State",
    zipCode: "ZIP Code",
    country: "Country",
    medicalConditions: "Medical Conditions",
    selectConditions: "Select Medical Conditions",
    kidneyDisease: "Kidney Disease",
    heartDisease: "Heart Disease",
    normalAdult: "Normal Adult",
    additionalInfo: "Additional Information",
    emergencyContact: "Emergency Contact",
    relationship: "Relationship",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    updating: "Updating...",
    profileUpdated: "Profile updated successfully!",
    chooseFile: "Choose File",
    noFileChosen: "No file chosen",
    cholesterol: "Cholesterol",
    cholesterolTotal: "Total Cholesterol",
    cholesterolLDL: "LDL Cholesterol",
    cholesterolHDL: "HDL Cholesterol",
    triglycerides: "Triglycerides",
    bloodPressure: "Blood Pressure",
    systolic: "Systolic",
    diastolic: "Diastolic",
    heartRate: "Heart Rate",
    bmi: "BMI",
    bloodSugar: "Blood Sugar",
    fastingGlucose: "Fasting Glucose",
    postprandialGlucose: "Postprandial Glucose",
    hba1c: "HbA1c",
    estimatedGFR: "Estimated GFR",
    albumin: "Albumin",
    calcium: "Calcium",
    phosphate: "Phosphate",
    uricAcid: "Uric Acid",
    allFields: "All Fields",
    prescriptions: "Prescriptions",
    uploadPrescription: "Upload Prescription",
    viewPrescription: "View Prescription",
    downloadPrescription: "Download",
    deletePrescription: "Delete",
    prescriptionName: "Prescription Name",
    uploadDate: "Upload Date",
    fileSize: "File Size",
    noPrescriptions: "No prescriptions uploaded yet",
    uploadNew: "Upload New Prescription",
    unsavedChanges: "You have unsaved changes!",
    saveBeforeClosing: "Save your changes before closing?",
    discard: "Discard Changes",
    continueEditing: "Continue Editing",
    confirmClose: "Confirm Close",
    deleteConfirm: "Are you sure you want to delete this prescription?",
    delete: "Delete",
    keep: "Keep"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    patients: "मरीज़",
    dataletHealthcareDashboard: "डाटालेटहेल्थकेयर™ डैशबोर्ड",
    patientsTitle: "मरीज़",
    patientDashboard: "रोगी डैशबोर्ड",
    patient: "रोगी",
    diagnosis: "निदान",
    years: "वर्ष",
    latestLabs: "नवीनतम लैब्स",
    creatinine: "क्रिएटिनिन",
    potassium: "पोटेशियम",
    sodium: "सोडियम",
    urea: "यूरिया",
    normal: "सामान्य",
    low: "कम",
    high: "उच्च",
    askTheAgent: "हेल्थ एजेंट से पूछें",
    personalizedAdvice: "व्यक्तिगत पोषण और स्वास्थ्य सलाह प्राप्त करें",
    questionPlaceholder: "जैसे: क्या मैं आज 200 मिलीलीटर दूध पी सकता हूँ?",
    askButton: "पूछें",
    clearButton: "साफ करें",
    askingButton: "पूछ रहे हैं...",
    aiResponse: "एआई प्रतिक्रिया",
    noResponse: "अभी तक कोई प्रतिक्रिया नहीं। व्यक्तिगत सलाह के लिए प्रश्न पूछें।",
    source: "स्रोत",
    context: "संदर्भ",
    waterIntake: "पानी का सेवन",
    today: "आज",
    quickAdd: "त्वरित जोड़",
    recentIntake: "हालिया सेवन",
    conditionContext: "स्थिति संदर्भ",
    kidney: "किडनी",
    heart: "हृदय",
    diabetes: "मधुमेह",
    copyright: "कॉपीराइट: डेटालैट रिसर्च लेबोरेटरी",
    loading: "डाटालेटहेल्थकेयर™ डैशबोर्ड लोड हो रहा है...",
    noData: "कोई लैब डेटा उपलब्ध नहीं",
    failedResponse: "प्रतिक्रिया प्राप्त करने में विफल",
    pricing: "मूल्य निर्धारण",
    choosePlan: "अपनी योजना चुनें",
    monthly: "/महीना",
    features: "सुविधाएं",
    basicPlan: "बेसिक",
    premiumPlan: "प्रीमियम",
    proPlan: "प्रो",
    mostPopular: "सबसे लोकप्रिय",
    currentPlan: "वर्तमान योजना",
    upgradeNow: "अभी अपग्रेड करें",
    getStarted: "शुरू करें",
    subscribe: "सदस्यता लें",
    unlimited: "असीमित",
    limited: "सीमित",
    yes: "हां",
    no: "नहीं",
    included: "शामिल",
    notIncluded: "शामिल नहीं",
    account: "खाता",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    logout: "लॉग आउट",
    notifications: "सूचनाएं",
    help: "मदद",
    admin: "व्यवस्थापक",
    viewProfile: "प्रोफ़ाइल देखें",
    editProfile: "प्रोफ़ाइल संपादित करें",
    prescriptions: "प्रिस्क्रिप्शन",
    uploadPrescription: "प्रिस्क्रिप्शन अपलोड करें",
    viewPrescription: "प्रिस्क्रिप्शन देखें",
    deletePrescription: "हटाएं",
    noPrescriptions: "अभी तक कोई प्रिस्क्रिप्शन अपलोड नहीं किया गया",
    unsavedChanges: "आपके पास सहेजे नहीं गए परिवर्तन हैं!",
    saveBeforeClosing: "बंद करने से पहले अपने परिवर्तन सहेजें?",
    discard: "परिवर्तन छोड़ें",
    continueEditing: "संपादन जारी रखें"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    patients: "রোগী",
    dataletHealthcareDashboard: "ডেটালেটহেলথকেয়ার™ ড্যাশবোর্ড",
    patientsTitle: "রোগী",
    patientDashboard: "রোগীর ড্যাশবোর্ড",
    patient: "রোগী",
    diagnosis: "নির্ণয়",
    years: "বছর",
    latestLabs: "সর্বশেষ ল্যাব",
    creatinine: "ক্রিয়েটিনিন",
    potassium: "পটাশিয়াম",
    sodium: "সোডিয়াম",
    urea: "ইউরিয়া",
    normal: "স্বাভাবিক",
    low: "কম",
    high: "উচ্চ",
    askTheAgent: "স্বাস্থ্য এজেন্টকে জিজ্ঞাসা করুন",
    personalizedAdvice: "ব্যক্তিগত পুষ্টি এবং স্বাস্থ্য পরামর্শ পান",
    questionPlaceholder: "যেমন: আমি কি আজ 200 মিলি দুধ পান করতে পারি?",
    askButton: "জিজ্ঞাসা করুন",
    clearButton: "সাফ করুন",
    askingButton: "জিজ্ঞাসা করছি...",
    aiResponse: "এআই প্রতিক্রিয়া",
    noResponse: "এখনও কোন প্রতিক্রিয়া নেই। ব্যক্তিগত পরামর্শের জন্য প্রশ্ন করুন।",
    source: "উৎস",
    context: "প্রসঙ্গ",
    waterIntake: "পানি গ্রহণ",
    today: "আজ",
    quickAdd: "দ্রুত যোগ করুন",
    recentIntake: "সাম্প্রতিক গ্রহণ",
    conditionContext: "অবস্থার প্রসঙ্গ",
    kidney: "কিডনি",
    heart: "হৃদয়",
    diabetes: "ডায়াবেটিস",
    copyright: "কপিরাইট: ডেটালেট রিসার্চ ল্যাবরেটরি",
    loading: "ডেটালেটহেলথকেয়ার™ ড্যাশবোর্ড লোড হচ্ছে...",
    noData: "কোন ল্যাব ডেটা নেই",
    failedResponse: "প্রতিক্রিয়া পাওয়া যায়নি",
    pricing: "মূল্য নির্ধারণ",
    choosePlan: "আপনার প্ল্যান নির্বাচন করুন",
    monthly: "/মাস",
    features: "বৈশিষ্ট্য",
    basicPlan: "বেসিক",
    premiumPlan: "প্রিমিয়াম",
    proPlan: "প্রো",
    mostPopular: "সবচেয়ে জনপ্রিয়",
    currentPlan: "বর্তমান প্ল্যান",
    upgradeNow: "এখনই আপগ্রেড করুন",
    getStarted: "শুরু করুন",
    subscribe: "সাবস্ক্রাইব করুন",
    unlimited: "অসীম",
    limited: "সীমিত",
    yes: "হ্যাঁ",
    no: "না",
    included: "অন্তর্ভুক্ত",
    notIncluded: "অন্তর্ভুক্ত নয়",
    account: "অ্যাকাউন্ট",
    profile: "প্রোফাইল",
    settings: "সেটিংস",
    logout: "লগআউট",
    notifications: "বিজ্ঞপ্তি",
    help: "সাহায্য",
    admin: "অ্যাডমিন",
    viewProfile: "প্রোফাইল দেখুন",
    editProfile: "প্রোফাইল সম্পাদনা করুন",
    prescriptions: "প্রেসক্রিপশন",
    uploadPrescription: "প্রেসক্রিপশন আপলোড করুন",
    viewPrescription: "প্রেসক্রিপশন দেখুন",
    deletePrescription: "মুছুন",
    noPrescriptions: "এখনও কোন প্রেসক্রিপশন আপলোড করা হয়নি",
    unsavedChanges: "আপনার কাছে সংরক্ষিত হয়নি এমন পরিবর্তন রয়েছে!",
    saveBeforeClosing: "বন্ধ করার আগে আপনার পরিবর্তনগুলি সংরক্ষণ করবেন?",
    discard: "পরিবর্তনগুলি বাতিল করুন",
    continueEditing: "সম্পাদনা চালিয়ে যান"
  }
};

// Language Context / Hook
const LanguageContext = createContext();
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('preferredLanguage') || 'en'
  );

  const tmap = translations[language] || translations.en;

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const translate = (key, fallback = '') => tmap[key] || fallback || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Loading spinner
const LoadingSpinner = () => {
  const { t } = useLanguage();
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', color: '#94a3b8'
    }}>
      <div>{t('loading')}</div>
    </div>
  );
};

// API base
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : "http://51.20.2.246:8000";

// Helper: post with fallback across multiple urls
async function postJsonWithFallback(urls = [], payload = {}, options = {}) {
  const timeoutMs = options.timeoutMs || 12000;
  for (const u of urls) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(u, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, t }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-dialog-overlay" onClick={onCancel}>
      <div className="confirmation-dialog-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirmation-dialog-actions">
          <button onClick={onCancel} className="cancel-btn">
            {cancelText || t('cancel')}
          </button>
          <button onClick={onConfirm} className="confirm-btn">
            {confirmText || t('saveChanges')}
          </button>
        </div>
      </div>
      <style jsx>{`
        .confirmation-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          // align-items: center;
          align-items: flex-start;
          padding-top: 40px; /* ✅ space from top changes made by Swarup*/
          padding-bottom: 40px;
          z-index: 3000;
          animation: fadeIn 0.2s ease;
        }
        
        .confirmation-dialog-content {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          animation: slideUp 0.3s ease;
        }
        
        .confirmation-dialog-content h3 {
          margin: 0 0 1rem 0;
          color: #f8fafc;
          font-size: 1.25rem;
        }
        
        .confirmation-dialog-content p {
          margin: 0 0 1.5rem 0;
          color: #94a3b8;
          line-height: 1.5;
        }
        
        .confirmation-dialog-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .cancel-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #f8fafc;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .confirm-btn {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .confirm-btn:hover {
          background: linear-gradient(135deg, #2563EB, #1E40AF);
          transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Prescription Item Component
const PrescriptionItem = ({ prescription, onView, onDelete, t }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="prescription-item">
      <div className="prescription-info">
        <div className="prescription-name">{prescription.name}</div>
        <div className="prescription-meta">
          <span className="upload-date">
            {new Date(prescription.uploadDate).toLocaleDateString()}
          </span>
          <span className="file-size">{formatFileSize(prescription.size)}</span>
        </div>
      </div>
      <div className="prescription-actions">
        <button 
          className="view-btn"
          onClick={() => onView(prescription)}
        >
          {t('viewPrescription')}
        </button>
        <button 
          className="delete-btn"
          onClick={() => onDelete(prescription.id)}
        >
          {t('deletePrescription')}
        </button>
      </div>
      <style jsx>{`
        .prescription-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .prescription-item:hover {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .prescription-info {
          flex: 1;
        }
        
        .prescription-name {
          font-weight: 500;
          color: #f8fafc;
          margin-bottom: 0.25rem;
        }
        
        .prescription-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .prescription-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .view-btn, .delete-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        
        .view-btn {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }
        
        .view-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        
        .delete-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
        
        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
};

// Profile Section Component
const ProfileSection = ({ isOpen, onClose, t }) => {
  // const [originalProfile, setOriginalProfile] = useState({
  //   fullName: "Prtish Ray",
  //   email: "prtish@example.com",
  //   phone: "+91 9876543210",
  //   dateOfBirth: "1998-05-15",
  //   gender: "male",
  //   height: 175,
  //   weight: 70,
  //   bloodGroup: "O+",
  //   address: "123 Healthcare Street",
  //   city: "Mumbai",
  //   state: "Maharashtra",
  //   zipCode: "400001",
  //   country: "India",
  //   emergencyContact: {
  //     name: "Jane Doe",
  //     phone: "+91 9876543211",
  //     relationship: "Spouse"
  //   },
  //   medicalConditions: ["kidney"],
  //   profilePicture: null
  // });

  const emptyProfile = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  medicalConditions: ["kidney"],
  gender: "",
  height: "",
  weight: "",
  bloodGroup: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  emergencyContact: {
    name: "",
    phone: "",
    relationship: ""
  },
  profilePicture: null
};

const [originalProfile, setOriginalProfile] = useState(null);

const [profile, setProfile] = useState(emptyProfile);

  // const [profile, setProfile] = useState({ ...originalProfile });
  const [selectedCondition, setSelectedCondition] = useState("kidney");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  const conditionForms = {
    kidney: [
      { id: 'creatinine', label: t('creatinine'), type: 'number', unit: 'mg/dL', normalRange: '0.6-1.3' },
      { id: 'potassium', label: t('potassium'), type: 'number', unit: 'mmol/L', normalRange: '3.5-5.1' },
      { id: 'sodium', label: t('sodium'), type: 'number', unit: 'mmol/L', normalRange: '135-145' },
      { id: 'urea', label: t('urea'), type: 'number', unit: 'mg/dL', normalRange: '7-20' },
      { id: 'estimatedGFR', label: t('estimatedGFR'), type: 'number', unit: 'mL/min/1.73m²', normalRange: '>60' },
      { id: 'albumin', label: t('albumin'), type: 'number', unit: 'g/dL', normalRange: '3.4-5.4' },
      { id: 'calcium', label: t('calcium'), type: 'number', unit: 'mg/dL', normalRange: '8.5-10.2' },
      { id: 'phosphate', label: t('phosphate'), type: 'number', unit: 'mg/dL', normalRange: '2.5-4.5' },
      { id: 'uricAcid', label: t('uricAcid'), type: 'number', unit: 'mg/dL', normalRange: '3.4-7.0' }
    ],
    heart: [
      { id: 'cholesterolTotal', label: t('cholesterolTotal'), type: 'number', unit: 'mg/dL', normalRange: '<200' },
      { id: 'cholesterolLDL', label: t('cholesterolLDL'), type: 'number', unit: 'mg/dL', normalRange: '<100' },
      { id: 'cholesterolHDL', label: t('cholesterolHDL'), type: 'number', unit: 'mg/dL', normalRange: '>40' },
      { id: 'triglycerides', label: t('triglycerides'), type: 'number', unit: 'mg/dL', normalRange: '<150' },
      { id: 'bloodPressureSystolic', label: t('systolic'), type: 'number', unit: 'mmHg', normalRange: '<120' },
      { id: 'bloodPressureDiastolic', label: t('diastolic'), type: 'number', unit: 'mmHg', normalRange: '<80' },
      { id: 'heartRate', label: t('heartRate'), type: 'number', unit: 'bpm', normalRange: '60-100' },
      { id: 'bmi', label: t('bmi'), type: 'number', unit: 'kg/m²', normalRange: '18.5-24.9' }
    ],
    diabetes: [
      { id: 'fastingGlucose', label: t('fastingGlucose'), type: 'number', unit: 'mg/dL', normalRange: '70-100' },
      { id: 'postprandialGlucose', label: t('postprandialGlucose'), type: 'number', unit: 'mg/dL', normalRange: '<140' },
      { id: 'hba1c', label: t('hba1c'), type: 'number', unit: '%', normalRange: '<5.7' },
      { id: 'cholesterolTotal', label: t('cholesterolTotal'), type: 'number', unit: 'mg/dL', normalRange: '<200' },
      { id: 'triglycerides', label: t('triglycerides'), type: 'number', unit: 'mg/dL', normalRange: '<150' },
      { id: 'bmi', label: t('bmi'), type: 'number', unit: 'kg/m²', normalRange: '18.5-24.9' },
      { id: 'bloodPressureSystolic', label: t('systolic'), type: 'number', unit: 'mmHg', normalRange: '<120' },
      { id: 'bloodPressureDiastolic', label: t('diastolic'), type: 'number', unit: 'mmHg', normalRange: '<80' }
    ],
    normalAdult: [
      { id: 'bloodPressureSystolic', label: t('systolic'), type: 'number', unit: 'mmHg', normalRange: '<120' },
      { id: 'bloodPressureDiastolic', label: t('diastolic'), type: 'number', unit: 'mmHg', normalRange: '<80' },
      { id: 'heartRate', label: t('heartRate'), type: 'number', unit: 'bpm', normalRange: '60-100' },
      { id: 'bmi', label: t('bmi'), type: 'number', unit: 'kg/m²', normalRange: '18.5-24.9' },
      { id: 'cholesterolTotal', label: t('cholesterolTotal'), type: 'number', unit: 'mg/dL', normalRange: '<200' },
      { id: 'fastingGlucose', label: t('fastingGlucose'), type: 'number', unit: 'mg/dL', normalRange: '70-100' },
      { id: 'creatinine', label: t('creatinine'), type: 'number', unit: 'mg/dL', normalRange: '0.6-1.3' }
    ]
  };

  // const [medicalData, setMedicalData] = useState({
  //   // Kidney data
  //   creatinine: 1.6,
  //   potassium: 5.2,
  //   sodium: 138,
  //   urea: 40,
  //   estimatedGFR: 65,
  //   albumin: 4.2,
  //   calcium: 9.1,
  //   phosphate: 3.8,
  //   uricAcid: 6.5,
  //   // Heart data
  //   cholesterolTotal: 195,
  //   cholesterolLDL: 110,
  //   cholesterolHDL: 45,
  //   triglycerides: 140,
  //   bloodPressureSystolic: 125,
  //   bloodPressureDiastolic: 82,
  //   heartRate: 75,
  //   bmi: 22.9,
  //   // Diabetes data
  //   fastingGlucose: 95,
  //   postprandialGlucose: 135,
  //   hba1c: 5.9
  // });

  // const [originalMedicalData, setOriginalMedicalData] = useState({ ...medicalData });

  const [medicalData, setMedicalData] = useState({
  creatinine: 0,
  potassium: 0,
  sodium: 0,
  urea: 0,
  estimatedGFR: 0,
  albumin: 0,
  calcium: 0,
  phosphate: 0,
  uricAcid: 0,

  cholesterolTotal: 0,
  cholesterolLDL: 0,
  cholesterolHDL: 0,
  triglycerides: 0,
  bloodPressureSystolic: 0,
  bloodPressureDiastolic: 0,
  heartRate: 0,
  bmi: 0,

  fastingGlucose: 0,
  postprandialGlucose: 0,
  hba1c: 0
});

const [originalMedicalData, setOriginalMedicalData] = useState({ ...medicalData });

// useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (!token) return;

//   fetch("http://localhost:4000/api/medical/data", {
//     headers: { Authorization: `Bearer ${token}` }
//   })
//     .then(res => res.json())
//     .then(data => {
//       setMedicalData(data);
//       setOriginalMedicalData(data);
//     })
//     .catch(err => console.error("Failed to fetch medical data:", err));
// }, []);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("http://localhost:4000/api/medical/data", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch medical data");
      return res.json();
    })
    .then(data => {
  if (!data) return;

  const mappedData = {
    // Kidney
    creatinine: data.creatinine ?? 0,
    potassium: data.potassium ?? 0,
    sodium: data.sodium ?? 0,
    urea: data.urea ?? 0,
    estimatedGFR: data.estimatedGFR ?? 0,
    albumin: data.albumin ?? 0,
    calcium: data.calcium ?? 0,
    phosphate: data.phosphate ?? 0,
    uricAcid: data.uricAcid ?? 0,

    // Heart
    cholesterolTotal: data.cholesterolTotal ?? 0,
    cholesterolLDL: data.cholesterolLDL ?? 0,
    cholesterolHDL: data.cholesterolHDL ?? 0,
    triglycerides: data.triglycerides ?? 0,
    bloodPressureSystolic: data.bloodPressureSystolic ?? 0,
    bloodPressureDiastolic: data.bloodPressureDiastolic ?? 0,
    heartRate: data.heartRate ?? 0,
    bmi: data.bmi ?? 0,

    // Diabetes
    fastingGlucose: data.fastingGlucose ?? 0,
    postprandialGlucose: data.postprandialGlucose ?? 0,
    hba1c: data.hba1c ?? 0,
  };

  setMedicalData(mappedData);
  setOriginalMedicalData(mappedData);
})
    .catch(err => console.error("Failed to fetch medical data:", err));
}, []);




const handleMedicalSave = async () => {
  const token = localStorage.getItem("token");

  // Only send fields that changed
  const updatedFields = {};
  for (const key in medicalData) {
    if (medicalData[key] !== originalMedicalData[key]) {
      updatedFields[key] = medicalData[key];
    }
  }

  if (Object.keys(updatedFields).length === 0) return;

  try {
    await fetch("http://localhost:4000/api/medical/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      
      },
      body: JSON.stringify(updatedFields),
    });

    setOriginalMedicalData({ ...medicalData });
    alert("Medical data saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Error saving medical data");
  }
};


// const handleMedicalDataChange = (id, value) => {
//   setMedicalData(prev => ({
//     ...prev,
//     [id]: value === "" ? 0 : parseFloat(value)  // convert empty string to 0, otherwise number
//   }));
// };

const handleMedicalDataChange = (key, value) => {
  setMedicalData(prev => ({
    ...prev,
    [key]: value === "" ? "" : parseFloat(value)
  }));

  setHasUnsavedChanges(true);
};














 


















  


// useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (!token) return;

//   fetch("http://localhost:4000/api/user/profile/basic", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then(async (res) => {
//       if (res.status === 304) return null;
//       if (!res.ok) throw new Error("Unauthorized");
//       return res.json();
//     })
//     .then((data) => {
//       if (!data) return;

//       const mappedProfile = {
//         fullName: data.full_name,
//         email: data.email,
//         phone: data.mobile,
//         dateOfBirth: data.dob,
//         address: data.address,
//         // medicalConditions: "kidney",
//         gender: data.gender || "N/A",
//         height: data.height || 0,
//         weight: data.weight || 0,
//         bloodGroup: data.blood_group || "N/A",
//         city: data.city || "N/A",
//         state: data.state || "N/A",
//         zipCode: data.zip_code || "N/A",
//         country: data.country || "N/A",
//         emergencyContact: {
//           name: data.emergency_contact_name || "N/A",
//           phone: data.emergency_contact_phone || "N/A",
//           relationship: data.emergency_contact_relationship || "N/A",
//         },
//         medicalConditions: ["kidney"], // static
//         profilePicture: null

//       };

//       setOriginalProfile(mappedProfile);
//       setProfile(mappedProfile);
//     })
//     .catch(console.error);
// }, []);



useEffect(() => {
  
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("http://localhost:4000/api/user/profile/basic", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      if (res.status === 304) return null;
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => {
      if (!data) return;

      // Merge with existing profile to prevent overwriting updates
      setProfile((prev) => ({
        ...prev,
        fullName: data.full_name || prev.fullName,
        email: data.email || prev.email,
        phone: data.mobile || prev.phone,
        dateOfBirth: data.dob || prev.dateOfBirth,
        address: data.address || prev.address,
        gender: data.gender || prev.gender,
        height: data.height || prev.height,
        weight: data.weight || prev.weight,
        bloodGroup: data.blood_group || prev.bloodGroup,
        city: data.city || prev.city,
        state: data.state || prev.state,
        zipCode: data.zip_code || prev.zipCode,
        country: data.country || prev.country,
        emergencyContact: {
          name: data.emergency_contact_name || prev.emergencyContact?.name || "N/A",
          phone: data.emergency_contact_phone || prev.emergencyContact?.phone || "N/A",
          relationship: data.emergency_contact_relationship || prev.emergencyContact?.relationship || "N/A",
        },
        medicalConditions: prev.medicalConditions || ["kidney"],
        profilePicture: prev.profilePicture || null,
      }));

      // You can still set originalProfile if needed
      setOriginalProfile((prev) => ({
        ...prev,
        ...data,
        emergencyContact: {
          name: data.emergency_contact_name || prev.emergencyContact?.name || "N/A",
          phone: data.emergency_contact_phone || prev.emergencyContact?.phone || "N/A",
          relationship: data.emergency_contact_relationship || prev.emergencyContact?.relationship || "N/A",
        },
      }));
    })
    .catch(console.error);
}, []);




// useEffect(() => {
//   if (activeTab !== "profile") return;

//   const token = localStorage.getItem("token");
//   if (!token) return;

//   fetch("http://localhost:4000/api/user/profile/basic", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then(res => res.json())
//     .then(data => {
//       setProfile({
//         fullName: data.full_name || "",
//         email: data.email || "",
//         phone: data.mobile || "",
//         dateOfBirth: data.dob || "",
//         gender: data.gender || "Other",
//         height: data.height || "",
//         weight: data.weight || "",
//         bloodGroup: data.blood_group || "",
//         address: data.address || "",
//         city: data.city || "",
//         state: data.state || "",
//         zipCode: data.zip_code || "",
//         country: data.country || "",
//         emergencyContact: {
//           name: data.emergency_contact_name || "N/A",
//           phone: data.emergency_contact_phone || "N/A",
//           relationship: data.emergency_contact_relationship || "N/A",
//         },
//         medicalConditions: ["kidney"],
//         profilePicture: null,
//       });

//       setOriginalProfile({
//         ...data,
//         emergencyContact: {
//           name: data.emergency_contact_name || "N/A",
//           phone: data.emergency_contact_phone || "N/A",
//           relationship: data.emergency_contact_relationship || "N/A",
//         },
//       });
//     })
//     .catch(console.error);

// }, [activeTab]);





  // Check for changes
  useEffect(() => {
    const profileChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    const medicalDataChanged = JSON.stringify(medicalData) !== JSON.stringify(originalMedicalData);
    const conditionChanged = selectedCondition !== "kidney"; // Default condition is kidney
    
    setHasUnsavedChanges(profileChanged || medicalDataChanged || conditionChanged);
  }, [profile, medicalData, selectedCondition, originalProfile, originalMedicalData]);

  const { user, setUser } = useUser();

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return; // no file selected

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in!");
    return;
  }
  
  const formData = new FormData();
  formData.append("image", e.target.files[0]);


  try {
    // If you are not using a proxy, replace "/api/..." with your backend URL like:
    // "http://localhost:4000/api/user/profile-image"
    const res = await fetch("http://localhost:4000/api/user/profile-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Upload failed:", errorData);
      alert("Error uploading image: " + (errorData.message || res.statusText));
      return;
    }

    const data = await res.json();
    console.log("Upload successful:", data);

    // Update user state with new profile image
    setUser({ ...user, profileImage: data.image });

    alert("Profile image updated successfully!");
  } catch (err) {
    console.error("Upload error:", err);
    alert("Error uploading image. Please try again.");
  }


};





useEffect(() => {
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:4000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setUser((prev) => ({
        ...prev,
        profileImage: data.profile_image,
        fullName: data.full_name,
        email: data.email,
      }));
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  fetchUserProfile();
}, []);

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPreviewImage(reader.result);
  //       setProfile(prev => ({ ...prev, profilePicture: file }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  // const handleMedicalDataChange = (id, value) => {
  //   setMedicalData(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  // };

  // const handlePrescriptionUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const newPrescription = {
  //       id: Date.now(),
  //       name: file.name,
  //       url: URL.createObjectURL(file),
  //       uploadDate: new Date().toISOString(),
  //       size: file.size,
  //       type: file.type
  //     };
  //     setPrescriptions(prev => [...prev, newPrescription]);
  //   }
  // };


//   const handlePrescriptionUpload = async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const token = localStorage.getItem("token");
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await fetch("http://localhost:4000/api/user/prescriptions", {
//     method: "POST",
//     headers: { Authorization: `Bearer ${token}` },
//     body: formData
//   });

//   const data = await res.json();

//   setPrescriptions(prev => [
//     {
//       ...data,
//       url: `http://localhost:4000${data.url}`
//     },
//     ...prev
//   ]);
// };

const handlePrescriptionUpload = async (e) => {
  const files = Array.from(e.target.files); // convert FileList to array
  if (files.length === 0) return;

  const formData = new FormData();

  // Validate each file and append to FormData
  for (const file of files) {
    const sizeKB = file.size / 1024;
    if (sizeKB < 10 || sizeKB > 100) {
      alert(`File ${file.name} must be between 10KB and 100KB`);
      return; // stop upload if any file is invalid
    }

    formData.append("images", file); // matches backend .array("images")
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:4000/api/user/prescriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    // Update state: prepend uploaded files to prescriptions
    setPrescriptions((prev) => [
      ...data.map((file) => ({
        ...file,
        url: `http://localhost:4000${file.url}`, // add full URL for frontend
      })),
      ...prev,
    ]);
  } catch (err) {
    console.error(err);
    alert("Upload failed, please try again.");
  }
};




useEffect(() => {
  const fetchPrescriptions = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      "http://localhost:4000/api/user/prescriptions",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();

    setPrescriptions(
      data.map(p => ({
        id: p.id,
        name: p.file_name,
        url: `http://localhost:4000${p.file_path}`,
        uploadDate: p.upload_date,
        size: p.file_size,
        type: p.file_type
      }))
    );
  };

  fetchPrescriptions();
}, []);











  const handleDeletePrescription = (id) => {
    setPrescriptionToDelete(id);
  };

  // const confirmDeletePrescription = () => {
  //   setPrescriptions(prev => prev.filter(p => p.id !== prescriptionToDelete));
  //   setPrescriptionToDelete(null);
  // };

  const confirmDeletePrescription = async () => {
  try {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:4000/api/user/prescriptions/${prescriptionToDelete}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setPrescriptions(prev =>
      prev.filter(p => p.id !== prescriptionToDelete)
    );
  } catch (err) {
    console.error("Delete failed", err);
    alert("Failed to delete prescription");
  } finally {
    setPrescriptionToDelete(null);
  }
};


  const handleViewPrescription = (prescription) => {
    setViewingPrescription(prescription);
  };






const handleSave = async () => {
  setIsSaving(true);
  const token = localStorage.getItem("token");

  const payload = {
    ...profile,
    dateOfBirth: profile.dateOfBirth
      ? profile.dateOfBirth.split("T")[0]
      : null,
  };

  try {
    const res = await fetch("http://localhost:4000/api/user/profile/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload), // ✅ use payload
    });

    if (!res.ok) {
      const errText = await res.text(); // 🔍 see backend reason
      console.error("Backend error:", errText);
      throw new Error("Failed to update profile");
    }

    const data = await res.json();

    const updatedProfile = {
      ...profile,
      ...data.profile,
      emergencyContact: {
        name: data.profile.emergency_contact_name || "N/A",
        phone: data.profile.emergency_contact_phone || "N/A",
        relationship: data.profile.emergency_contact_relationship || "N/A",
      },
      profilePicture: null,
    };

    setOriginalProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsSaving(false);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    alert("Profile updated successfully!");
  } catch (err) {
    console.error(err);
    setIsSaving(false);
    alert("Error updating profile");
  }

};


const handleCombinedSave = async () => {
  setIsSaving(true);

  try {
    await handleSave();          // profile
    await handleMedicalSave();   // medical

    setIsEditing(false);
    setHasUnsavedChanges(false);
  } catch (err) {
    console.error(err);
  } finally {
    setIsSaving(false);
  }
};



  const handleEditToggle = () => {
    if (isEditing && hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      setIsEditing(!isEditing);
      if (!isEditing) {
        // When starting to edit, set originals
        setOriginalProfile({ ...profile });
        setOriginalMedicalData({ ...medicalData });
      }
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges && isEditing) {
      setShowConfirmClose(true);
    } else {
      resetToOriginal();
      onClose();
    }
  };

  const resetToOriginal = () => {
    setProfile({ ...originalProfile });
    setMedicalData({ ...originalMedicalData });
    setSelectedCondition("kidney");
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  // const getInitials = () => {
  //   return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase();
  // };
  const getInitials = () => {
  if (!profile?.fullName) return "";
  return profile.fullName.charAt(0).toUpperCase();
};




  if (!isOpen) return null;

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmClose}
        title={t('unsavedChanges')}
        message={t('saveBeforeClosing')}
        onConfirm={() => {
          handleSave();
          setShowConfirmClose(false);
        }}
        onCancel={() => {
          resetToOriginal();
          setShowConfirmClose(false);
          onClose();
        }}
        confirmText={t('saveChanges')}
        cancelText={t('discard')}
        t={t}
      />

      <ConfirmationDialog
        isOpen={prescriptionToDelete !== null}
        title={t('deleteConfirm')}
        message={t('deleteConfirm')}
        onConfirm={() => {
          confirmDeletePrescription();
        }}
        onCancel={() => setPrescriptionToDelete(null)}
        confirmText={t('delete')}
        cancelText={t('keep')}
        t={t}
      />

      {/* {viewingPrescription && (
        <div className="prescription-viewer-overlay" onClick={() => setViewingPrescription(null)}>
          <div className="prescription-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-header">
              <h3>{viewingPrescription.name}</h3>
              <button className="close-viewer-btn" onClick={() => setViewingPrescription(null)}>×</button>
            </div>
            <div className="viewer-body">
              {viewingPrescription.type.startsWith('image/') ? (
                <img src={viewingPrescription.url}
          alt={viewingPrescription.name} className="prescription-image" />
              ) : (
                <div className="pdf-placeholder">
                  <div className="pdf-icon">📄</div>
                  <p>Prescription Document Preview</p>
                  <a href={viewingPrescription.url} download className="download-btn">
                    {t('downloadPrescription')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* {viewingPrescription && viewingPrescription.type.startsWith("image/") && (
        <div className="prescription-viewer-overlay" onClick={() => setViewingPrescription(null)}>
          <div className="prescription-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-header">
              <h3>{viewingPrescription.name}</h3>
              <button className="close-viewer-btn" onClick={() => setViewingPrescription(null)}>×</button>
            </div>
             <div className="viewer-body">
            <div className="viewer-body">
              {viewingPrescription.type.startsWith('image/') ? (
                <img src={viewingPrescription.url}
          alt={viewingPrescription.name} className="prescription-image" />
              ) : (
                <div className="pdf-placeholder">
                  <div className="pdf-icon">📄</div>
                  <p>Prescription Document Preview</p>
                  <a href={viewingPrescription.url} download className="download-btn">
                    {t('downloadPrescription')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}
      {viewingPrescription && viewingPrescription.type.startsWith("image/") && (
  <div
    className="prescription-viewer-overlay"
    onClick={() => setViewingPrescription(null)}
  >
    <div
      className="prescription-viewer-content"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="viewer-header">
        <h3>{viewingPrescription.name}</h3>
        <button
          className="close-viewer-btn"
          onClick={() => setViewingPrescription(null)}
        >
          ×
        </button>
      </div>
      <div className="viewer-body">
        <img
          src={viewingPrescription.url}
          alt={viewingPrescription.name}
          className="prescription-image"
        />
      </div>
    </div>
  </div>
)}


      <div className="profile-modal-overlay" onClick={handleClose}>
        <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="profile-modal-header">
            <h2>{t('profileSection')}</h2>
            <button className="close-modal-btn" onClick={handleClose}>×</button>
          </div>

          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  {/* {previewImage ? (
                    <img src={previewImage} alt="Profile" className="profile-picture" />
                  ) : (
                    <div className="profile-picture-placeholder">
                      <span className="profile-initials">{getInitials()}</span>
                    </div>
                  )} */}
                  {/* {user?.profile_image ? (
    <img
      src={user.profile_image}
      className="profile-picture"
      alt="Profile"
    />
  ) : (
    <div className="profile-picture-placeholder">
      <span className="profile-initials">{getInitials()}</span>
    </div>
  )} */}
  {user?.profileImage ? (
    <img
      src={`http://localhost:4000${user.profileImage}`} // full URL
      className="profile-picture"
      alt="Profile"
    />
  ) : (
    <div className="profile-picture-placeholder">
      <span className="profile-initials">{getInitials()}</span>
    </div>
  )}
                </div>
                
                <div className="upload-section">
                  <input
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                    disabled={!isEditing}
                  />
                  <label htmlFor="profile-upload" className="upload-btn">
                    {isEditing ? t('changePhoto') : t('viewProfile')}
                  </label>
                </div>
              </div>

              <div className="quick-info">
                <h3>{profile.fullName}</h3>
                <p className="user-email">{profile.email}</p>
                <div className="user-plan-badge">Premium Plan</div>
                
                <div className="medical-condition-selector">
                  <label>{t('medicalConditions')}</label>
                  <select 
                    value={selectedCondition} 
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="condition-select"
                    // disabled={!isEditing}
                  >
                    <option value="kidney">{t('kidneyDisease')}</option>
                    <option value="heart">{t('heartDisease')}</option>
                    <option value="diabetes">{t('diabetes')}</option>
                    <option value="normalAdult">{t('normalAdult')}</option>
                  </select>
                </div>

                {hasUnsavedChanges && isEditing && (
                  <div className="unsaved-changes-badge">
                    ⚠️ {t('unsavedChanges')}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-main">
              <div className="profile-section">
                <div className="section-header">
                  <h3>{t('personalDetails')}</h3>
                  <button 
                    className="edit-btn"
                    onClick={handleEditToggle}
                  >
                    {isEditing ? t('cancel') : '✏️ ' + t('editProfile')}
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('FullName')}</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  {/* <div className="form-group">
                    <label>{t('lastName')}</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div> */}

                  <div className="form-group">
                    <label>{t('emailAddress')}</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('phoneNumber')}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('dateOfBirth')}</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      // value={profile.dateOfBirth}
                      value={
      profile.dateOfBirth
        ? profile.dateOfBirth.split("T")[0]
        : ""
    }
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('gender')}</label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    >
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('height')}</label>
                    <input
                      type="number"
                      name="height"
                      value={profile.height}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('weight')}</label>
                    <input
                      type="number"
                      name="weight"
                      value={profile.weight}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('bloodGroup')}</label>
                    <select
                      name="bloodGroup"
                      value={profile.bloodGroup}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>{t('address')}</label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('city')}</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('state')}</label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('zipCode')}</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={profile.zipCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('country')}</label>
                    <input
                      type="text"
                      name="country"
                      value={profile.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>{t('medicalConditions')} - {selectedCondition === 'kidney' ? t('kidneyDisease') : 
                  selectedCondition === 'heart' ? t('heartDisease') : 
                  selectedCondition === 'diabetes' ? t('diabetes') : t('normalAdult')}</h3>
                
                <div className="medical-form-grid">
                  {conditionForms[selectedCondition].map((field) => (
                    <div key={field.id} className="medical-form-group">
                      <label>{field.label}</label>
                      <div className="medical-input-group">
                        {/* <input
                          type={field.type}
                          value={medicalData[field.id] || ''}
                          onChange={(e) => handleMedicalDataChange(field.id, e.target.value)}
                          disabled={!isEditing}
                          className="medical-form-input"
                          placeholder={`Normal: ${field.normalRange}`}
                        /> */}
                        <input
  type={field.type}
  value={medicalData[field.id] ?? ''}
  onChange={(e) => handleMedicalDataChange(field.id, e.target.value)}
  disabled={!isEditing}
  className="medical-form-input"
  placeholder={`Normal: ${field.normalRange}`}
/>
                        <span className="medical-unit">{field.unit}</span>
                      </div>
                      <div className="normal-range">Normal: {field.normalRange}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3>{t('prescriptions')}</h3>
                
                <div className="prescription-upload-section">
                  <input
                    type="file"
                    id="prescription-upload"
                    accept="image/*"
                    multiple 
                    onChange={handlePrescriptionUpload}
                    className="file-input"
                    disabled={!isEditing}
                  />
                  <label htmlFor="prescription-upload" className="prescription-upload-btn">
                    📄 {t('uploadPrescription')}
                  </label>
                </div>

                <div className="prescriptions-list">
                  {prescriptions.length === 0 ? (
                    <div className="no-prescriptions">
                      <div className="no-prescriptions-icon">📄</div>
                      <p>{t('noPrescriptions')}</p>
                    </div>
                  ) : (
                    // prescriptions.map((prescription) => (
                    //   <PrescriptionItem
                    //     key={prescription.id}
                    //     prescription={prescription}
                    //     onView={handleViewPrescription}
                    //     onDelete={handleDeletePrescription}
                    //     t={t}
                    //   />
                    // ))
                    prescriptions.map((p) => (
    <div key={p.id} className="prescription-item">
      <span>{p.name}</span>
      {p.type.startsWith("image/") && (
        <button onClick={() => setViewingPrescription(p)}>View</button>
      )}
      <button onClick={() => handleDeletePrescription(p.id)}>Delete</button>
    </div>
  ))
                  )}
                </div>
              </div>

              <div className="profile-section">
                <h3>{t('emergencyContact')}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('firstName')}</label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={profile.emergencyContact.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('phoneNumber')}</label>
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={profile.emergencyContact.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('relationship')}</label>
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={profile.emergencyContact.relationship}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="action-buttons">
                  <button 
                    className="save-btn"
                    onClick={handleCombinedSave}
                    disabled={isSaving}
                  >
                    {isSaving ? t('updating') : t('saveChanges')}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      if (hasUnsavedChanges) {
                        setShowConfirmClose(true);
                      } else {
                        setIsEditing(false);
                      }
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <style jsx>{`
          .condition-select option {
          color: #000000; /* black text -Changes made by Swarup*/
          background-color: #ffffff; /* Changes made by Swarup*/
          }
          select.form-input option {
  color: black;           /* text color for each option */
  background-color: #fff; /* background color for options */
}
          .profile-modal-overlay {
            position: fixed;
            // top: 0;
            // left: 0;
            // right: 0;
            // bottom: 0;
            inset: 0; /* Changes Made by Swarup */
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: flex-start;      /* Changes Made by Swarup */
            z-index: 2000;
            animation: fadeIn 0.3s ease;
            padding: 20px;
          }
          
          .profile-modal-content {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            width: 90%;
            max-width: 1200px;
            // max-height: 90vh; /* Changes Made by Swarup */
            height: 90vh; 
            // overflow-y: auto;
            overflow: hidden;
            animation: slideUp 0.3s ease;
          }
          
          .profile-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: sticky;
            top: 0;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            z-index: 10;
          }
          
          .profile-modal-header h2 {
            font-size: 1.75rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3B82F6, #10B981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
          }
          
          .close-modal-btn {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s ease;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .close-modal-btn:hover {
            color: #f8fafc;
          }
          
          .profile-content {
            display: flex;
            // min-height: 600px; /* Changes Made by Swarup  add below two line*/
            height: 100%; 
            overflow-y: auto; 
          }
          
          .profile-sidebar {
            flex: 0 0 300px;
            background: rgba(255, 255, 255, 0.03);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            overflow-y: auto; /* Changes Made by Swarup */
          }
          
          .profile-picture-section {
            text-align: center;
          }
          
          .profile-picture-container {
            width: 150px;
            height: 150px;
            margin: 0 auto 1.5rem;
            position: relative;
          }
          
          .profile-picture {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #3B82F6;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          }
          
          .profile-picture-placeholder {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #3B82F6, #10B981);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #3B82F6;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          }
          
          .profile-initials {
            font-size: 3rem;
            font-weight: 700;
            color: white;
          }
          
          .upload-section {
            margin-top: 1rem;
          }
          
          .file-input {
            display: none;
          }
          
          .upload-btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            color: #93c5fd;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.875rem;
          }
          
          .upload-btn:hover {
            background: rgba(59, 130, 246, 0.2);
          }
          
          .upload-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .quick-info {
            text-align: center;
          }
          
          .quick-info h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f8fafc;
            margin-bottom: 0.5rem;
          }
          
          .user-email {
            color: #94a3b8;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }
          
          .user-plan-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #10B981, #10B98180);
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            color: white;
            margin-bottom: 1.5rem;
          }
          
          .unsaved-changes-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            color: #fbbf24;
            margin-top: 1rem;
            animation: pulse 2s infinite;
          }
          
          .medical-condition-selector {
            text-align: left;
          }
          
          .medical-condition-selector label {
            display: block;
            font-size: 0.875rem;
            color: #94a3b8;
            margin-bottom: 0.5rem;
          }
          
          .condition-select {
            width: 100%;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #f8fafc;
            font-size: 0.875rem;
            cursor: pointer;
          }
          
          .condition-select:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .profile-main {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
            padding-bottom: 140px;
          }
          
          .profile-section {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .profile-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .profile-section h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f8fafc;
            margin: 0;
          }
          
          .edit-btn {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            color: #93c5fd;
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.875rem;
          }
          
          .edit-btn:hover {
            background: rgba(59, 130, 246, 0.2);
          }
          
          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .form-group {
            margin-bottom: 1rem;
          }
          
          .form-group.full-width {
            grid-column: 1 / -1;
          }
          
          .form-group label {
            display: block;
            font-size: 0.875rem;
            color: #94a3b8;
            margin-bottom: 0.5rem;
          }
          
          .form-input {
            width: 100%;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #f8fafc;
            font-size: 0.875rem;
            transition: all 0.3s ease;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #3B82F6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }
          
          .form-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .medical-form-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          
          .medical-form-group {
            margin-bottom: 1.5rem;
          }
          
          .medical-form-group label {
            display: block;
            font-size: 0.875rem;
            color: #94a3b8;
            margin-bottom: 0.5rem;
          }
          
          .medical-input-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .medical-form-input {
            flex: 1;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #f8fafc;
            font-size: 0.875rem;
            transition: all 0.3s ease;
          }
          
          .medical-form-input:focus {
            outline: none;
            border-color: #3B82F6;
          }
          
          .medical-form-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .medical-unit {
            font-size: 0.75rem;
            color: #94a3b8;
            white-space: nowrap;
          }
          
          .normal-range {
            font-size: 0.75rem;
            color: #10B981;
            margin-top: 0.25rem;
          }
          
          .prescription-upload-section {
            margin-bottom: 1.5rem;
          }
          
          .prescription-upload-btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            color: #93c5fd;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          .prescription-upload-btn:hover {
            background: rgba(59, 130, 246, 0.2);
          }
          
          .prescription-upload-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .prescriptions-list {
            max-height: 300px;
            overflow-y: auto;
          }
          
          .no-prescriptions {
            text-align: center;
            padding: 3rem 1rem;
            color: #94a3b8;
          }
          
          .no-prescriptions-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }
          
          .prescription-viewer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            // align-items: center;
            align-items: flex-start;
            z-index: 3000;
            // padding: 20px;
            padding-top: 40px;
          }
          
          .prescription-viewer-content {
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s ease;
          }
          
          .viewer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(15, 23, 42, 0.95);
            border-radius: 12px 12px 0 0;
          }
          
          .viewer-header h3 {
            margin: 0;
            font-size: 1.125rem;
            color: #f8fafc;
          }
          
          .close-viewer-btn {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .close-viewer-btn:hover {
            color: #f8fafc;
          }
          
          .viewer-body {
            flex: 1;
            // padding: 1.5rem;  /* Changes made by Swarup */
            padding: 0; 
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .prescription-image {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 8px;
          }
          
          .pdf-placeholder {
            text-align: center;
            padding: 2rem;
          }
          
          .pdf-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: #3B82F6;
          }
          
          .pdf-placeholder p {
            color: #94a3b8;
            margin-bottom: 1.5rem;
          }
          
          .download-btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            border: none;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .download-btn:hover {
            background: linear-gradient(135deg, #2563EB, #1E40AF);
            transform: translateY(-2px);
          }
          
          .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 2rem;
            // border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .save-btn {
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .save-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563EB, #1E40AF);
            transform: translateY(-2px);
          }
          
          .save-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .cancel-btn {
            background: rgba(241, 9, 9, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #f8fafc;
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .cancel-btn:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
          
          @media (max-width: 1024px) {
            .profile-content {
              flex-direction: column;
            }
            
            .profile-sidebar {
              flex: none;
              border-right: none;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .form-grid {
              grid-template-columns: 1fr;
            }
            
            .medical-form-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          @media (max-width: 768px) {
            .profile-modal-content {
              width: 95%;
              max-height: 95vh;
            }
            
            .profile-modal-header {
            position: sticky; /* changes made by swarup */
            top: 0; /* changes made by swarup */
            z-index: 10; /* changes made by swarup */
              padding: 1rem;
            }
            
            .profile-modal-header h2 {
              font-size: 1.25rem;
            }
            
            .profile-sidebar,
            .profile-main {
              padding: 1rem;
            }
            
            .profile-picture-container {
              width: 100px;
              height: 100px;
            }
            
            .profile-initials {
              font-size: 2rem;
            }
            
            .medical-form-grid {
              grid-template-columns: 1fr;
            }
            
            .action-buttons {
              flex-direction: column;
            }
            
            .save-btn,
            .cancel-btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </>
  );
};

// Updated AccountDropdown Component with Profile Section integration
const AccountDropdown = ({ t, onClose }) => {

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { logout } = useAuth();



  // Read user Input
const { user, setUser } = useUser();



  return (
    <>
      <div className="account-dropdown-container">
        <button
          className="account-button"
          onClick={() => setShowDropdown(!showDropdown)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        >
          <div className="account-avatar">
            {/* <span className="avatar-initials">
              {user?.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "U"}
            </span> */}
             {/* {user?.profileImage ? (
    <img
      src={user.profile_image}
      className="avatar-img"
      alt="Profile"
    />
  ) : (
    <span className="avatar-initials">
      {user?.full_name
        ?.split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase() || "U"}
    </span>
  )} */}
  {user?.profileImage ? (
  <img
    src={`http://localhost:4000${user.profileImage}`}
    className="avatar-img"
    alt="Profile"
  />
) : (
  <span className="avatar-initials">
    {user?.full_name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase() || "U"}
  </span>
)}
          </div>
          {/* <span className="account-name">Prtish</span> */}
          <span className="account-name">
           {user?.full_name || "User"}
          </span>
          <span className="dropdown-arrow">▼</span>
        </button>

        {showDropdown && (
          <div className="account-dropdown-menu">
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-avatar-large">
                  {/* <span className="avatar-initials-large">
                    {user?.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "U"}
                  </span> */}
                  {user?.profileImage ? (
  <img
    src={`http://localhost:4000${user.profileImage}`}
    className="avatar-img"
    alt="Profile"
  />
) : (
  <span className="avatar-initials">
    {user?.full_name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase() || "U"}
  </span>
)}
                </div>
                <div className="user-details">
                  {/* <h4>Prtish</h4> */}
                  <h4>{user?.full_name || "User"}</h4>
                  {/* <p className="user-email">{user?.email || "Email"}</p> */}
                  <span className="user-plan-badge">Premium Plan</span>
                </div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <div className="dropdown-items">
              <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setShowProfile(true); setShowDropdown(false); }}>
                <span className="item-icon">👤</span>
                <span>{t('viewProfile')}</span>
              </a>
              <a href="#" className="dropdown-item">
                <span className="item-icon">⚙️</span>
                <span>{t('settings')}</span>
              </a>
              <a href="#" className="dropdown-item">
                <span className="item-icon">🔔</span>
                <span>{t('notifications')}</span>
                <span className="notification-badge">3</span>
              </a>
              <a href="#" className="dropdown-item">
                <span className="item-icon">👨‍⚕️</span>
                <span>{t('admin')}</span>
              </a>
              <a href="#" className="dropdown-item">
                <span className="item-icon">❓</span>
                <span>{t('help')}</span>
              </a>
            </div>

            <div className="dropdown-divider"></div>

            <div className="dropdown-footer">
              {/* <button className="logout-button">
                <span className="item-icon">🚪</span>
                <span>{t('logout')}</span>
              </button> */}
              <button
  className="logout-button"
  onClick={logout}
>
  <span className="item-icon">🚪</span>
  <span>{t('logout')}</span>
</button>
            </div>
          </div>
        )}
      </div>

      <ProfileSection 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        t={t} 
      />
    </>
  );
};

// Pricing Modal Component
const PricingModal = ({ isOpen, onClose, t, currentPlan = "premium" }) => {
  if (!isOpen) return null;

  const plans = [
    {
      id: "basic",
      name: t('basicPlan'),
      price: "₹6500",
      color: "#3B82F6",
      features: [
        { name: "AI Support", included: true },
        { name: "Diet Guidance", included: true },
        { name: "Chat Bot Dietician Access", included: false },
        { name: "Chats per Month", value: "500" },
        { name: "Medication Alerts", included: false },
        { name: "Priority Support", included: false }
      ],
      popular: false
    },
    {
      id: "premium",
      name: t('premiumPlan'),
      price: "₹7500",
      color: "#10B981",
      features: [
        { name: "AI Support", included: true },
        { name: "Diet Guidance", included: true },
        { name: "Chat Bot Dietician Access", included: true },
        { name: "Chats per Month", value: t('unlimited') },
        { name: "Medication Alerts", included: true },
        { name: "Priority Support", included: true },
        { name: "Limited AI Support in Medication", included: true }
      ],
      popular: true
    },
    {
      id: "pro",
      name: t('proPlan'),
      price: "₹10000",
      color: "#8B5CF6",
      features: [
        { name: "AI Support", included: true },
        { name: "Diet Guidance", included: true },
        { name: "Chat Bot Dietician Access", included: true },
        { name: "Chats per Month", value: t('unlimited') },
        { name: "Medication Alerts", included: true },
        { name: "Priority Support", included: true },
        { name: "Everything Unlimited", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "24/7 Phone Support", included: true }
      ],
      popular: false
    }
  ];

  const handlePayment = (planId) => {
    window.open(`https://your-payment-gateway.com/pay?plan=${planId}`, '_blank');
    onClose();
  };

  return (
    <div className="pricing-modal-overlay" onClick={onClose}>
      <div className="pricing-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pricing-modal-header">
          <h2>{t('choosePlan')}</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="pricing-plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-plan-card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
              style={{
                borderColor: plan.popular ? plan.color : 'rgba(255, 255, 255, 0.1)',
                background: plan.popular ? `linear-gradient(135deg, rgba(${parseInt(plan.color.slice(1, 3), 16)}, ${parseInt(plan.color.slice(3, 5), 16)}, ${parseInt(plan.color.slice(5, 7), 16)}, 0.1), rgba(15, 23, 42, 0.8))` : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              {plan.popular && (
                <div className="popular-badge" style={{ backgroundColor: plan.color }}>
                  {t('mostPopular')}
                </div>
              )}

              {currentPlan === plan.id && (
                <div className="current-badge" style={{ backgroundColor: '#3B82F6' }}>
                  {t('currentPlan')}
                </div>
              )}

              <div className="plan-header">
                <h3 style={{ color: plan.color }}>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{t('monthly')}</span>
                </div>
              </div>

              <div className="plan-features">
                <h4>{t('features')}</h4>
                <ul>
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      {feature.included === undefined ? (
                        <>
                          <span className="feature-name">{feature.name}:</span>
                          <span className="feature-value">{feature.value}</span>
                        </>
                      ) : (
                        <>
                          <span className={`feature-check ${feature.included ? 'included' : 'not-included'}`}>
                            {feature.included ? '✓' : '✗'}
                          </span>
                          <span className={`feature-name ${!feature.included ? 'not-included' : ''}`}>
                            {feature.name}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="subscribe-btn"
                onClick={() => handlePayment(plan.id)}
                style={{
                  background: plan.popular ? `linear-gradient(135deg, ${plan.color}, ${plan.color}80)` : 'rgba(255, 255, 255, 0.1)',
                  borderColor: plan.color
                }}
              >
                {currentPlan === plan.id ? t('currentPlan') : t('subscribe')}
                {currentPlan !== plan.id && ` ${plan.price}${t('monthly')}`}
              </button>
            </div>
          ))}
        </div>

        <div className="payment-methods">
          <p>All major payment methods accepted: UPI, Debit Card, Credit Card, Net Banking</p>
        </div>
      </div>
    </div>
  );
};

function AppContent() {

const [patients, setPatients] = useState([]);

  // const [patients, setPatients] = useState([{ id: 1, name: "prtish", diagnosis: "Kidney disease", age: 26 }]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [lab, setLab] = useState({ creatinine: 1.6, potassium: 5.2, sodium: 138, urea: 40 });
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
  const [conditionMap, setConditionMap] = useState({ 1: ["kidney"] });
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("premium");
  const [pricingButtonHover, setPricingButtonHover] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const { language, setLanguage, t } = useLanguage();


  useEffect(() => {
    document.title = t('dataletHealthcareDashboard');
  }, [language, t]);

  // useEffect(() => {
  //   setSelectedPatient(patients[0]);
  //   setIsInitialized(true);
  // }, []);

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
      const res = await fetch("http://localhost:4000/api/user/profile/basic", {
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
        condition_context: getCurrentConditionContext(),
        lab_report: lab
      };

      const base = API_BASE.replace(/\/$/, "");
const endpoints = [
  `${base}/ask-agent/ask/`,
  `${base}/ask/`,
  `${base}/ask`
];

      const resultWrap = await postJsonWithFallback(endpoints, payload, { timeoutMs: 12000 });

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

  function LabBadge({ label, value, normalRange, unit }) {
    const { t } = useLanguage();
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
          <span>{t(label.toLowerCase())}</span>
          <div className="lab-status" style={{ backgroundColor: statusColors[status] }}>{t(status)}</div>
        </div>
        <div className="lab-value">
          {numericValue !== null && !Number.isNaN(numericValue) ? numericValue : "—"} {unit && <span className="lab-unit">{unit}</span>}
        </div>
        {normalRange && <div className="lab-range">{t('normal')}: {normalRange}</div>}
      </div>
    );
  }

  

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


  

  if (!isInitialized) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        t={t}
        currentPlan={currentPlan}
      />

      <ProfileSection 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        t={t} 
      />

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

      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="logo-container">
              <h1>{t('dataletHealthcareDashboard')}</h1>
            </div>
          </div>

          <div className="nav-menu">
            <button
              className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              {t('dashboard')}
            </button>
            <button
              className={`nav-tab ${activeTab === "patients" ? "active" : ""}`}
              onClick={() => setActiveTab("patients")}
            >
              {t('patients')}
            </button>
            <button
              className={`nav-tab ${activeTab === "pricing" ? "active" : ""}`}
              onClick={() => {
                setShowPricing(true);
                setActiveTab("pricing");
              }}
            >
              {t('pricing')}
            </button>
          </div>

          <div className="nav-actions">
            <button
              className="pricing-button"
              onClick={() => setShowPricing(true)}
              onMouseEnter={() => setPricingButtonHover(true)}
              onMouseLeave={() => setPricingButtonHover(false)}
              style={{
                animation: pricingButtonHover ? 'pricingPulse 2s infinite' : 'none'
              }}
            >
              <span className="pricing-icon">💎</span>
              <span className="pricing-text">{t('pricing')}</span>
              <span className="pricing-arrow">→</span>
            </button>

            <div className="language-selector">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="bn">BN</option>
              </select>
            </div>

            <div className="account-section">
              <AccountDropdown t={t} />
            </div>
          </div>

          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <button
              className={`mobile-nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
            >
              {t('dashboard')}
            </button>
            <button
              className={`mobile-nav-tab ${activeTab === "patients" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("patients");
                setMobileMenuOpen(false);
              }}
            >
              {t('patients')}
            </button>
            <button
              className={`mobile-nav-tab ${activeTab === "pricing" ? "active" : ""}`}
              onClick={() => {
                setShowPricing(true);
                setActiveTab("pricing");
                setMobileMenuOpen(false);
              }}
            >
              💎 {t('pricing')}
            </button>
            <div className="mobile-account-section">
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  <span>P</span>
                </div>
                <div className="mobile-user-details">
                  <h4>Prtish</h4>
                  <p>Premium Plan</p>
                </div>
              </div>
              <div className="mobile-account-links">
                <a href="#" className="mobile-account-link" onClick={(e) => { e.preventDefault(); setShowProfile(true); setMobileMenuOpen(false); }}>
                  <span>👤</span> {t('profile')}
                </a>
                <a href="#" className="mobile-account-link">
                  <span>⚙️</span> {t('settings')}
                </a>
                <a href="#" className="mobile-account-link">
                  <span>🔔</span> {t('notifications')} <span className="mobile-notification-badge">3</span>
                </a>
                <a href="#" className="mobile-account-link">
                  <span>❓</span> {t('help')}
                </a>
                <button className="mobile-logout-btn">
                  <span>🚪</span> {t('logout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="dashboard-content">
        <div className="sidebar">
          <h2 className="sidebar-title">{t('patientsTitle')}</h2>

          <div className="pricing-sidebar-card">
            <div className="pricing-sidebar-header">
              <h3>{t('currentPlan')}</h3>
              <span className="plan-badge" style={{
                background: currentPlan === 'premium' ? 'linear-gradient(135deg, #10B981, #10B98180)' :
                  currentPlan === 'pro' ? 'linear-gradient(135deg, #8B5CF6, #8B5CF680)' :
                    'linear-gradient(135deg, #3B82F6, #3B82F680)'
              }}>
                {currentPlan.toUpperCase()}
              </span>
            </div>
            <div className="pricing-sidebar-info">
              <div className="plan-price">
                <span className="price">
                  {currentPlan === 'basic' ? '₹6500' : currentPlan === 'premium' ? '₹7500' : '₹10000'}
                </span>
                <span className="period">/6month</span>
              </div>
              <p className="plan-desc">
                {currentPlan === 'basic' ? 'Basic AI Support + 500 Chats' :
                  currentPlan === 'premium' ? 'Unlimited Everything' :
                    'Pro Features + 24/7 Support'}
              </p>
              <button
                className="upgrade-btn"
                onClick={() => {
                  setShowPricing(true);
                  setActiveTab("pricing");
                }}
              >
                {t('upgradeNow')}
              </button>
            </div>
          </div>

          <div className="patient-list">
            {patients.map(p => (
              <div key={p.id} className={`patient-card ${selectedPatient && selectedPatient.id === p.id ? "active" : ""}`} onClick={() => setSelectedPatient(p)}>
                <div className="patient-info">
                  <div className="patient-name">{p.name}</div>
                  <div className="patient-diagnosis">{p.diagnosis || '—'}</div>
                  <div className="patient-conditions">{(conditionMap[p.id] || []).map(d => (<span key={d} className="condition-tag">{t(d)}</span>))}</div>
                </div>
                {/* <div className="patient-age">{p.age || '—'} {t('years')}</div> */}
                <div className="patient-age">
                      {p.age !== null ? `${p.age} ${t('years')}` : `— ${t('years')}`}
</div>

              </div>
            ))}
          </div>
        </div>

        <main className="main-content">
          <div className="content-header">
            <div className="header-info">
              <h1>{t('patientDashboard')}</h1>
              <p className="patient-selected">{t('patient')}: <span>{selectedPatient?.name ?? '—'}</span></p>
              {selectedPatient && (
                <div className="condition-selector">
                  <span>{t('conditionContext')}:</span>
                  {[
                    { id: "kidney", label: t('kidney'), color: "#3B82F6" },
                    { id: "heart", label: t('heart'), color: "#EF4444" },
                    { id: "diabetes", label: t('diabetes'), color: "#10B981" }
                  ].map(d => {
                    const active = (conditionMap[selectedPatient.id] || []).includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => toggleDomain(d.id)}
                        className={`condition-btn ${active ? "active" : ""}`}
                        style={active ? {
                          backgroundColor: `${d.color}22`,
                          borderColor: d.color,
                          transform: 'scale(1.05)'
                        } : {}}
                      >
                        {d.label}
                        {active && <span className="pulse-dot"></span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lab-summary-card">
              <div className="lab-summary-header">
                <h3>{t('latestLabs')}</h3>
              </div>
              {(!lab || Object.keys(lab).length === 0) ? (
                <div className="lab-empty"><small>{t('noData')}</small></div>
              ) : (
                <div className="lab-grid">
                  <LabBadge label="creatinine" value={lab?.creatinine} normalRange="0.6-1.3" unit="mg/dL" />
                  <LabBadge label="potassium" value={lab?.potassium} normalRange="3.5-5.1" unit="mmol/L" />
                  <LabBadge label="sodium" value={lab?.sodium} normalRange="135-145" unit="mmol/L" />
                  <LabBadge label="urea" value={lab?.urea} normalRange="7-20" unit="mg/dL" />
                  
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="main-panel">
              <div className="panel-header">
                <h2>{t('askTheAgent')}</h2>
                <p>{t('personalizedAdvice')}</p>
              </div>

              <form onSubmit={handleAsk} className="ask-form">
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('questionPlaceholder')} className="question-input" />
                <div className="form-actions">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                  </select>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('askingButton') : t('askButton')}</button>
                  <button type="button" onClick={() => { setQuestion(''); setAiResponse(null); }} className="btn-secondary">{t('clearButton')}</button>
                </div>
                {errorMsg && <div className="error-message">{errorMsg}</div>}
              </form>

              <div className="response-section">
                <h3>{t('aiResponse')}</h3>
                <div className="response-container">
                  {!loading && aiResponse == null && (
                    <div className="no-response">
                      <div className="no-response-icon">💬</div>
                      <p>{t('noResponse')}</p>
                    </div>
                  )}

                  {!loading && aiResponse && (
                    <div className="ai-response">
                      <div className="response-text">
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', color: 'inherit' }}>
                          {aiResponse.nutrition_summary}
                        </pre>
                      </div>

                      <div className="response-meta">
                        {aiResponse.ai_source && <span><strong>{t('source')}:</strong> {aiResponse.ai_source}</span>}
                        {aiResponse.clinical_classification && <span><strong>Classification:</strong> {aiResponse.clinical_classification}</span>}
                        {aiResponse.clinical_reasoning && <span><strong>Reason:</strong> {aiResponse.clinical_reasoning}</span>}
                        {aiResponse.condition_context && aiResponse.condition_context.length > 0 && (
                          <span><strong>{t('context')}:</strong> {Array.isArray(aiResponse.condition_context) ? aiResponse.condition_context.join(", ") : aiResponse.condition_context}</span>
                        )}
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

            <div className="sidebar-panels">
              <div className="panel water-tracker">
                <h3>{t('waterIntake')}</h3>
                <div className="water-summary">
                  <div className="water-today">
                    <span className="water-label">{t('today')}</span>
                    <span className="water-amount">{todayTotal} ml</span>
                  </div>
                  <div className="water-level-container">
                    <div className="water-level-fill" style={{ height: `${Math.min((todayTotal / 2000) * 100, 100)}%` }}></div>
                    <div className="water-level-markers">
                      <span>2L</span><span>1.5L</span><span>1L</span><span>500ml</span><span>0</span>
                    </div>
                  </div>
                </div>

                <div className="water-actions">
                  <label>{t('quickAdd')}</label>
                  <div className="water-buttons">
                    <button onClick={() => handleWaterIntake(200)} className="water-btn">+200 ml</button>
                    <button onClick={() => handleWaterIntake(100)} className="water-btn">+100 ml</button>
                  </div>
                </div>

                <div className="recent-water-logs">
                  <h4>{t('recentIntake')}</h4>
                  <div className="water-log-list">
                    {waterLogs.slice(-3).reverse().map(log => (
                      <div key={log.id} className="water-log-item">
                        <span className="log-time">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="log-amount">{log.volume_ml} ml</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="dashboard-footer">
            <p>{t('copyright')}</p>
          </footer>
        </main>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
        }
        
        .navbar {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0;
        }
        
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
        }
        
        .nav-brand h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #3B82F6, #10B981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .nav-menu {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        
        .nav-tab {
          background: none;
          border: none;
          color: #94a3b8;
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        
        .nav-tab:hover {
          color: #e2e8f0;
        }
        
        .nav-tab.active {
          color: #3B82F6;
        }
        
        .nav-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 0;
          right: 0;
          height: 2px;
          background: #3B82F6;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .pricing-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #3B82F6, #10B981);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 0.5rem 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          min-width: 120px;
        }
        
        .pricing-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: 0.5s;
        }
        
        .pricing-button:hover::before {
          left: 100%;
        }
        
        .pricing-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }
        
        .pricing-icon {
          font-size: 1.2rem;
          animation: sparkle 1.5s infinite;
        }
        
        .pricing-arrow {
          transition: transform 0.3s ease;
        }
        
        .pricing-button:hover .pricing-arrow {
          transform: translateX(4px);
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pricingPulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        .language-selector select {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #f8fafc;
          padding: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .account-section {
          position: relative;
        }
        
        .account-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          color: #f8fafc;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .account-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .account-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #10B981);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          overflow: hidden; 
        }

        .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* crop, don’t stretch */
  border-radius: 50%;
}
        
        .avatar-initials {
          color: white;
        }
        
        .account-name {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .dropdown-arrow {
          font-size: 0.75rem;
          transition: transform 0.3s ease;
        }
        
        .account-button:hover .dropdown-arrow {
          transform: rotate(180deg);
        }
        
        .account-dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 280px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        
        .dropdown-header {
          padding: 1.25rem;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-avatar-large {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #10B981);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
        }
        
        .avatar-initials-large {
          color: white;
        }
        
        .user-details h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .user-email {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0 0 0.5rem 0;
        }
        
        .user-plan-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #10B981, #10B98180);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }
        
        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0;
        }
        
        .dropdown-items {
          padding: 0.5rem 0;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f8fafc;
        }
        
        .item-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }
        
        .notification-badge {
          position: absolute;
          right: 1.25rem;
          background: #EF4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
        }
        
        .dropdown-footer {
          padding: 0.75rem 1.25rem;
        }
        
        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .logout-button:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          gap: 4px;
          padding: 0.5rem;
        }
        
        .mobile-menu-toggle span {
          width: 24px;
          height: 2px;
          background: #f8fafc;
          transition: all 0.3s ease;
        }
        
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mobile-nav-tab {
          background: none;
          border: none;
          color: #94a3b8;
          padding: 1rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        
        .mobile-nav-tab:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .mobile-nav-tab.active {
          color: #3B82F6;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .mobile-account-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }
        
        .mobile-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #10B981);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }
        
        .mobile-user-details h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }
        
        .mobile-user-details p {
          margin: 0;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .mobile-account-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .mobile-account-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .mobile-account-link:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .mobile-notification-badge {
          margin-left: auto;
          background: #EF4444;
          color: white;
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
        }
        
        .mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          cursor: pointer;
          width: 100%;
          margin-top: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .mobile-logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        
        .dashboard-content {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          gap: 1.5rem;
          min-height: calc(100vh - 80px);
        }
        
        .sidebar {
          flex: 0 0 300px;
        }
        
        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #f8fafc;
        }
        
        .pricing-sidebar-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .pricing-sidebar-card:hover {
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }
        
        .pricing-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .pricing-sidebar-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #94a3b8;
          margin: 0;
        }
        
        .plan-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }
        
        .pricing-sidebar-info {
          text-align: center;
        }
        
        .plan-price {
          margin-bottom: 0.5rem;
        }
        
        .plan-price .price {
          font-size: 2rem;
          font-weight: 700;
          color: #3B82F6;
        }
        
        .plan-price .period {
          font-size: 0.875rem;
          color: #94a3b8;
        }
        
        .plan-desc {
          font-size: 0.875rem;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }
        
        .upgrade-btn {
          width: 100%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #93c5fd;
          padding: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .upgrade-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          transform: translateY(-1px);
        }
        
        .patient-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .patient-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .patient-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .patient-card.active {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        .patient-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #f8fafc;
        }
        
        .patient-diagnosis {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        
        .patient-conditions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .condition-tag {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
        }
        
        .patient-age {
          font-size: 0.875rem;
          color: #cbd5e1;
          text-align: right;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .content-header {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.5rem;
          align-items: start;
        }
        
        .header-info h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #f8fafc;
        }
        
        .patient-selected {
          color: #94a3b8;
          margin-bottom: 1rem;
        }
        
        .patient-selected span {
          color: #e2e8f0;
          font-weight: 600;
        }
        
        .condition-selector {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .condition-selector span {
          font-size: 0.875rem;
          color: #94a3b8;
        }
        
        .condition-btn {
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: transparent;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .condition-btn:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .condition-btn.active {
          color: #f8fafc;
          font-weight: 500;
        }
        
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .lab-summary-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.25rem;
          position: sticky;
          top: 80px;
        }
        
        .lab-summary-header h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: #94a3b8;
        }
        
        .lab-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        
        .lab-badge {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .lab-badge:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .lab-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .lab-label span {
          font-size: 0.875rem;
          color: #94a3b8;
        }
        
        .lab-status {
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          color: white;
          text-transform: capitalize;
        }
        
        .lab-value {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #f8fafc;
        }
        
        .lab-unit {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: normal;
        }
        
        .lab-range {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        
        .main-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
        }
        
        .panel-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #f8fafc;
        }
        
        .panel-header p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }
        
        .ask-form {
          margin-bottom: 1.5rem;
        }
        
        .question-input {
          width: 100%;
          min-height: 100px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          color: #f8fafc;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .question-input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .form-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        
        .language-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #f8fafc;
          padding: 0.5rem;
          cursor: pointer;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 0.5rem 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563EB, #1E40AF);
          transform: translateY(-1px);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #f8fafc;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .error-message {
          color: #fca5a5;
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          font-size: 0.875rem;
        }
        
        .response-section h3 {
          color: #94a3b8;
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
        }
        
        .response-container {
          background: rgba(11, 18, 32, 0.5);
          border-radius: 8px;
          padding: 1.5rem;
          min-height: 150px;
        }
        
        .no-response {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 150px;
          color: #94a3b8;
          text-align: center;
        }
        
        .no-response-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .ai-response {
          color: #e6eef8;
        }
        
        .response-text {
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .response-text pre {
          margin: 0;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        .response-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .water-context {
          margin-top: 12px;
          padding: 10px;
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          font-size: 0.875rem;
        }
        
        .sidebar-panels {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.25rem;
        }
        
        .panel h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #f8fafc;
        }
        
        .water-summary {
          margin-bottom: 1rem;
        }
        
        .water-today {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .water-label {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .water-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3B82F6;
        }
        
        .water-level-container {
          position: relative;
          height: 120px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          margin-bottom: 1rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .water-level-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, #3B82F6, #60A5FA);
          transition: height 0.5s ease-in-out;
          border-radius: 0 0 8px 8px;
        }
        
        .water-level-markers {
          position: absolute;
          right: 8px;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .water-actions {
          margin-bottom: 1rem;
        }
        
        .water-actions label {
          display: block;
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        
        .water-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .water-btn {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 6px;
          color: #93c5fd;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          font-size: 0.875rem;
        }
        
        .water-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        
        .recent-water-logs {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        
        .water-log-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .water-log-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
        }
        
        .log-time {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .log-amount {
          font-size: 0.875rem;
          font-weight: 600;
          color: #3B82F6;
        }
        
        .dashboard-footer {
          text-align: center;
          color: #94a3b8;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: auto;
        }
        
        /* Pricing Modal Styles */
        .pricing-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        
        .pricing-modal-content {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          width: 90%;
          max-width: 1200px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        
        .pricing-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .pricing-modal-header h2 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3B82F6, #10B981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }
        
        .close-modal-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-modal-btn:hover {
          color: #f8fafc;
        }
        
        .pricing-plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .pricing-plan-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        
        .pricing-plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .pricing-plan-card.popular {
          border-width: 2px;
        }
        
        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.25rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          white-space: nowrap;
        }
        
        .current-badge {
          position: absolute;
          top: -10px;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }
        
        .plan-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .plan-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #f8fafc;
        }
        
        .plan-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.25rem;
        }
        
        .price-amount {
          font-size: 2.5rem;
          font-weight: 800;
          color: #f8fafc;
        }
        
        .price-period {
          font-size: 0.875rem;
          color: #94a3b8;
        }
        
        .plan-features {
          margin-bottom: 1.5rem;
          flex: 1;
        }
        
        .plan-features h4 {
          font-size: 1rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }
        
        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .plan-features li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .feature-check {
          margin-right: 0.5rem;
          font-size: 1rem;
        }
        
        .feature-check.included {
          color: #10B981;
        }
        
        .feature-check.not-included {
          color: #EF4444;
        }
        
        .feature-name {
          flex: 1;
          color: #cbd5e1;
          font-size: 0.875rem;
        }
        
        .feature-name.not-included {
          color: #94a3b8;
          text-decoration: line-through;
        }
        
        .feature-value {
          font-weight: 600;
          color: #3B82F6;
          font-size: 0.875rem;
        }
        
        .subscribe-btn {
          width: 100%;
          padding: 1rem;
          border: 1px solid;
          border-radius: 8px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: auto;
          font-size: 1rem;
        }
        
        .subscribe-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .payment-methods {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .payment-methods p {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0;
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 1024px) {
          .pricing-plans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .content-header {
            grid-template-columns: 1fr;
          }
          
          .lab-summary-card {
            position: relative;
            top: auto;
          }
        }
        
        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }
          
          .mobile-menu-toggle {
            display: flex;
          }
          
          .mobile-menu {
            display: flex;
          }
          
          .pricing-button {
            padding: 0.5rem;
          }
          
          .pricing-button .pricing-text {
            display: none;
          }
          
          .account-button .account-name {
            display: none;
          }
          
          .account-button .dropdown-arrow {
            display: none;
          }
          
          .account-button {
            padding: 0.5rem;
          }
          
          .dashboard-content {
            flex-direction: column;
            padding: 1rem;
          }
          
          .sidebar {
            flex: none;
            width: 100%;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .content-header {
            grid-template-columns: 1fr;
          }
          
          .pricing-plans-grid {
            grid-template-columns: 1fr;
          }
          
          .nav-container {
            padding: 1rem;
          }
          
          .nav-brand h1 {
            font-size: 1.25rem;
          }
          
          .pricing-button {
            min-width: auto;
          }
          
          .pricing-icon {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

// Main App export
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

    </Routes>
  );
}