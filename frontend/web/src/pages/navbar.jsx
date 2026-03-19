import React, { useState, useEffect } from "react";
// import { useAuth } from "./useAuth";
// import { useUser } from "./useUser";
import { useUser } from "../contexts/UserContext.jsx";
// import ChatWidget from "./components/ChatWidget";
// import { Routes, Route } from "react-router-dom";
// import Signup from "./pages/Signup.jsx";
// import ChatHistory from "./pages/ChatHistory";
import { useAuth } from "../hooks/useAuth.js";
import { useLanguage } from "../contexts/LanguageContext";
import AutoText from "../components/AutoText";
// import { createContext, useContext } from 'react';



// API base
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : "http://localhost:8000";

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

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-dialog-overlay" onClick={onCancel}>
            <div className="confirmation-dialog-content" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirmation-dialog-actions">
                    <button onClick={onCancel} className="cancel-btn">
                        {/* {cancelText || t('cancel')} */}
                        {cancelText || <AutoText>Cancel</AutoText>}

                    </button>
                    <button onClick={onConfirm} className="confirm-btn">
                        {/* {confirmText || t('saveChanges')} */}
                        {confirmText || <AutoText>Save Changes</AutoText>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Prescription Item Component
const PrescriptionItem = ({ prescription, onView, onDelete }) => {
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
                    {/* {t('viewPrescription')} */}
                    <AutoText>View Prescription</AutoText>
                </button>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(prescription.id)}
                >
                    {/* {t('deletePrescription')} */}
                    <AutoText>Delete Prescription</AutoText>
                </button>
            </div>
        </div>
    );
};

// Profile Section Component
const ProfileSection = ({ isOpen, onClose, t }) => {

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
            {
                id: "creatinine", label: "Creatinine", type: "number", unit: "mg/dL", normalRange: "0.6-1.3",
            },
            {
                id: "potassium", label: "Potassium", type: "number", unit: "mmol/L", normalRange: "3.5-5.1",
            },
            {
                id: "sodium", label: "Sodium", type: "number", unit: "mmol/L", normalRange: "135-145",
            },
            {
                id: "urea", label: "Urea", type: "number", unit: "mg/dL", normalRange: "7-20",
            },
            {
                id: "estimatedGFR", label: "Estimated GFR", type: "number", unit: "mL/min/1.73m²", normalRange: ">60",
            },
            {
                id: "albumin", label: "Albumin", type: "number", unit: "g/dL", normalRange: "3.4-5.4",
            },
            {
                id: "calcium", label: "Calcium", type: "number", unit: "mg/dL", normalRange: "8.5-10.2",
            },
            {
                id: "phosphate", label: "Phosphate", type: "number", unit: "mg/dL", normalRange: "2.5-4.5",
            },
            {
                id: "uricAcid", label: "Uric Acid", type: "number", unit: "mg/dL", normalRange: "3.4-7.0",
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

        normalAdult: [
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



    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:8000/api/medical/data", {
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
            await fetch("http://localhost:8000/api/medical/update", {
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





    const handleMedicalDataChange = (key, value) => {
        setMedicalData(prev => ({
            ...prev,
            [key]: value === "" ? "" : parseFloat(value)
        }));

        setHasUnsavedChanges(true);
    };


    useEffect(() => {
        if (!isOpen) return;   // important: run only when modal opens

        const token = localStorage.getItem("token");
        if (!token) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/user/profile/basic",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await res.json();
                if (!data) return;

                const formattedProfile = {
                    fullName: data.full_name ?? "",
                    email: data.email ?? "",
                    phone: data.mobile ?? "",
                    dateOfBirth: data.dob
                        ? data.dob.split("T")[0]
                        : "",
                    address: data.address ?? "",
                    gender: data.gender ?? "",
                    height: data.height ?? "",
                    weight: data.weight ?? "",
                    bloodGroup: data.blood_group ?? "",
                    city: data.city ?? "",
                    state: data.state ?? "",
                    zipCode: data.zip_code ?? "",
                    country: data.country ?? "",
                    emergencyContact: {
                        name: data.emergency_contact_name ?? "",
                        phone: data.emergency_contact_phone ?? "",
                        relationship: data.emergency_contact_relationship ?? "",
                    },
                    medicalConditions: ["kidney"],
                    profilePicture: null,
                };

                // Replace full state (no partial merge)
                setProfile(formattedProfile);
                setOriginalProfile(formattedProfile);

            } catch (error) {
                console.error("Profile fetch error:", error);
            }
        };

        fetchProfile();

    }, [isOpen]);












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
            // "http://localhost:8000/api/user/profile-image"
            const res = await fetch("http://localhost:8000/api/user/profile-image", {
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
                const res = await fetch("http://localhost:8000/api/user/me", {
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

            const res = await fetch("http://localhost:8000/api/user/prescriptions", {
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
                    url: `http://localhost:8000${file.url}`, // add full URL for frontend
                })),
                ...prev,
            ]);

            //Sangram
            // ✅ ADD THIS PART BELOW
            const medRes = await fetch("http://localhost:8000/api/medical/data", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const medData = await medRes.json();
            setMedicalData(medData);
            //Sangram End

        } catch (err) {
            console.error(err);
            alert("Upload failed, please try again.");
        }
    };


    useEffect(() => {
        const fetchPrescriptions = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(
                "http://localhost:8000/api/user/prescriptions",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();

            setPrescriptions(
                data.map(p => ({
                    id: p.id,
                    name: p.file_name,
                    url: `http://localhost:8000${p.file_path}`,
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


    const confirmDeletePrescription = async () => {
        try {
            const token = localStorage.getItem("token");

            await fetch(
                `http://localhost:8000/api/user/prescriptions/${prescriptionToDelete}`,
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
            const res = await fetch("http://localhost:8000/api/user/profile/update", {
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

    const [showProfile, setShowProfile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [pricingButtonHover, setPricingButtonHover] = useState(false);


    if (!isOpen) return null;

    return (
        <>
            <PricingModal
                isOpen={showPricing}
                onClose={() => setShowPricing(false)}
                t={t}
            // currentPlan={currentPlan}
            />

            <ProfileSection
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                t={t}
            />
            <ConfirmationDialog
                isOpen={showConfirmClose}
                title={<AutoText>Unsaved Changes</AutoText>}
                message={<AutoText>Save your changes before closing?</AutoText>}
                onConfirm={() => {
                    handleSave();
                    setShowConfirmClose(false);
                }}
                onCancel={() => {
                    resetToOriginal();
                    setShowConfirmClose(false);
                    onClose();
                }}
                confirmText={<AutoText>Save Changes</AutoText>}
                cancelText={<AutoText>Discard</AutoText>}
                t={t}
            />

            <ConfirmationDialog
                isOpen={prescriptionToDelete !== null}
                title={<AutoText>Delete Confirmation</AutoText>}
                message={<AutoText>Are you sure you want to delete this prescription?</AutoText>}
                onConfirm={() => {
                    confirmDeletePrescription();
                }}
                onCancel={() => setPrescriptionToDelete(null)}
                confirmText={<AutoText>Delete</AutoText>}
                cancelText={<AutoText>Keep</AutoText>}
                t={t}
            />


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
                        <h2><AutoText>Profile Section</AutoText></h2>
                        <button className="close-modal-btn" onClick={handleClose}>×</button>
                    </div>

                    <div className="profile-content">
                        <div className="profile-sidebar">
                            <div className="profile-picture-section">
                                <div className="profile-picture-container">

                                    {user?.profileImage ? (
                                        <img
                                            src={`http://localhost:8000${user.profileImage}`} // full URL
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
                                        accept="image/*,.pdf"
                                        onChange={handleImageUpload}
                                        className="file-input"
                                        disabled={!isEditing}
                                    />
                                    <label htmlFor="profile-upload" className="upload-btn">
                                        {isEditing ? <AutoText>Change Photo</AutoText> : <AutoText>View Profile</AutoText>}
                                    </label>
                                </div>
                            </div>

                            <div className="quick-info">
                                <h3>{profile.fullName}</h3>
                                <p className="user-email">{profile.email}</p>
                                <div className="user-plan-badge"><AutoText>Premium Plan</AutoText></div>

                                <div className="medical-condition-selector">
                                    <label><AutoText>Medical Conditions</AutoText></label>
                                    <select
                                        value={selectedCondition}
                                        onChange={(e) => setSelectedCondition(e.target.value)}
                                        className="condition-select"
                                    // disabled={!isEditing}
                                    >
                                        <option value="kidney"><AutoText>Kidney Disease</AutoText></option>
                                        <option value="heart"><AutoText>Heart Disease</AutoText></option>
                                        <option value="diabetes"><AutoText>Diabetes</AutoText></option>
                                        <option value="normalAdult"><AutoText>Normal Adult</AutoText></option>
                                    </select>
                                </div>

                                {hasUnsavedChanges && isEditing && (
                                    <div className="unsaved-changes-badge">
                                        ⚠️ <AutoText>You have unsaved changes!</AutoText>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="profile-main">
                            <div className="profile-section">
                                <div className="section-header">
                                    <h3><AutoText>Personal Details</AutoText></h3>
                                    <button
                                        className="edit-btn"
                                        onClick={handleEditToggle}
                                    >
                                        {isEditing ? <AutoText>Cancel</AutoText> : <><AutoText>✏️ Edit Profile</AutoText></>}
                                    </button>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><AutoText>Full Name</AutoText></label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profile.fullName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                        />
                                    </div>



                                    <div className="form-group">
                                        <label><AutoText>Email Address</AutoText></label>
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
                                        <label><AutoText>Phone Number</AutoText></label>
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
                                        <label><AutoText>Date of Birth</AutoText></label>
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
                                        <label><AutoText>Gender</AutoText></label>
                                        <select
                                            name="gender"
                                            value={profile.gender}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                        >
                                            <option value="male"><AutoText>Male</AutoText></option>
                                            <option value="female"><AutoText>Female</AutoText></option>
                                            <option value="other"><AutoText>Other</AutoText></option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label><AutoText>Height (cm)</AutoText></label>
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
                                        <label><AutoText>Weight (kg)</AutoText></label>
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
                                        <label><AutoText>Blood Group</AutoText></label>
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
                                        <label><AutoText>Address</AutoText></label>
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
                                        <label><AutoText>City</AutoText></label>
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
                                        <label><AutoText>State</AutoText></label>
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
                                        <label><AutoText>ZIP Code</AutoText></label>
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
                                        <label><AutoText>Country</AutoText></label>
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
                                <h3>
                                    <AutoText>Medical Conditions</AutoText> -{" "}
                                    {selectedCondition === "kidney" ? (
                                        <AutoText>Kidney Disease</AutoText>
                                    ) : selectedCondition === "heart" ? (
                                        <AutoText>Heart Disease</AutoText>
                                    ) : selectedCondition === "diabetes" ? (
                                        <AutoText>Diabetes</AutoText>
                                    ) : (
                                        <AutoText>Normal Adult</AutoText>
                                    )}
                                </h3>

                                <div className="medical-form-grid">
                                    {conditionForms[selectedCondition].map((field) => (
                                        <div key={field.id} className="medical-form-group">
                                            {/* <label>{field.label}</label> */}
                                            <label><AutoText>{field.label}</AutoText></label>
                                            <div className="medical-input-group">
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
                                <h3><AutoText>Prescriptions</AutoText></h3>

                                <div className="prescription-upload-section">
                                    <input
                                        type="file"
                                        id="prescription-upload"
                                        accept="image/*,.pdf"
                                        multiple
                                        onChange={handlePrescriptionUpload}
                                        className="file-input"
                                        disabled={!isEditing}
                                    />
                                    <label htmlFor="prescription-upload" className="prescription-upload-btn">
                                        <AutoText>📄 Upload Prescription</AutoText>
                                    </label>
                                </div>

                                <div className="prescriptions-list">
                                    {prescriptions.length === 0 ? (
                                        <div className="no-prescriptions">
                                            <div className="no-prescriptions-icon">📄</div>
                                            <p><AutoText>No prescriptions uploaded</AutoText></p>
                                        </div>
                                    ) : (

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
                                <h3><AutoText>Emergency Contact</AutoText></h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><AutoText>First Name</AutoText></label>
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
                                        <label><AutoText>Phone Number</AutoText></label>
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
                                        <label><AutoText>Relationship</AutoText></label>
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
                                        {isSaving ? <AutoText>Updating...</AutoText> : <AutoText>Save Changes</AutoText>}
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
                                        <AutoText>Cancel</AutoText>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Updated AccountDropdown Component with Profile Section integration
const AccountDropdown = ({ t, onClose }) => {

    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const { logout } = useAuth();
    const handleClearCache = async (e) => {
        e.preventDefault();
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((name) => caches.delete(name)));
            }
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) await reg.unregister();
            }
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload(true);
        } catch (error) {
            console.error("Failed to clear cache:", error);
            window.location.reload(true);
        }
    };
    // Read user Input
    const { user, setUser } = useUser();

    //added for separatinng first name from full name ,  by Dibyaranjan
    const fullName = user?.fullName || user?.full_name || "User";
    const firstName = fullName.split(" ")[0];


    return (
        <>
            <div className="account-dropdown-container">
                <button
                    className="account-button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                >
                    <div className="account-avatar">

                        {user?.profileImage ? (
                            <img
                                src={`http://localhost:8000${user.profileImage}`}
                                className="avatar-img"
                                alt="Profile"
                            />
                        ) : (
                            <span className="avatar-initials">
                                {/* {user?.full_name
                                    ?.split(" ")
                                    .map(n => n[0])
                                    .join("")
                                    .toUpperCase() || "U"} */}
                                {(user?.fullName || user?.full_name)
                                    ?.split(" ")
                                    .map(n => n[0])
                                    .join("")
                                    .toUpperCase() || "U"}
                            </span>
                        )}
                    </div>
                    {/* <span className="account-name">Prtish</span> */}
                    {/* <span className="account-name">
                        {user?.full_name || "User"}
                    </span>
                    <span className="dropdown-arrow">▼</span> */}
                    {/* //changes made by Dibyaranjan. */}


                    <span className="account-name">
                        {firstName}
                    </span>

                    {/* end of changes made by Dibyaranjan. */}

                    <span className="dropdown-arrow">▼</span>
                </button>

                {showDropdown && (
                    <div className="account-dropdown-menu">
                        <div className="dropdown-header">
                            <div className="user-info">
                                <div className="user-avatar-large">

                                    {user?.profileImage ? (
                                        <img
                                            src={`http://localhost:8000${user.profileImage}`}
                                            className="avatar-img"
                                            alt="Profile"
                                        />
                                    ) : (
                                        <span className="avatar-initials">
                                            {/* {user?.full_name
                                                ?.split(" ")
                                                .map(n => n[0])
                                                .join("")
                                                .toUpperCase() || "U"} */}

                                            {(user?.fullName || user?.full_name)
                                                ?.split(" ")
                                                .map(n => n[0])
                                                .join("")
                                                .toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>
                                <div className="user-details">
                                    {/* <h4>Prtish</h4> */}
                                    {/* <h4>{user?.full_name || "User"}</h4> */}
                                    {/* <p className="user-email">{user?.email || "Email"}</p> */}
                                    <h4>
                                        Hi {firstName} !!!<span className="wave">👋</span>
                                    </h4>
                                    <span className="user-plan-badge">Premium Plan</span>
                                </div>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        <div className="dropdown-items">
                            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setShowProfile(true); setShowDropdown(false); }}>
                                <span className="item-icon">👤</span>
                                {/* <span>{t('viewProfile')}</span> */}
                                <span>
                                    <AutoText>View Profile</AutoText>
                                </span>
                            </a>
                            <a href="#" className="dropdown-item">
                                <span className="item-icon">❓</span>
                                {/* <span>{t('help')}</span> */}
                                <span>
                                    <AutoText>Help</AutoText>
                                </span>
                            </a>
                            <a href="#" className="dropdown-item" onClick={handleClearCache}>
                                <span className="item-icon">🧹</span>
                                <span>
                                    <AutoText>Clear Cache</AutoText>
                                </span>
                            </a>
                        </div>

                        <div className="dropdown-divider"></div>

                        <div className="dropdown-footer">

                            <button
                                className="logout-button"
                                onClick={logout}
                            >
                                <span className="item-icon">🚪</span>
                                {/* <span>{t('logout')}</span> */}
                                <span>
                                    <AutoText>Logout</AutoText>
                                </span>
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
            name: <AutoText>Basic</AutoText>,
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
            name: <AutoText>Premium</AutoText>,
            price: "₹7500",
            color: "#10B981",
            features: [
                { name: "AI Support", included: true },
                { name: "Diet Guidance", included: true },
                { name: "Chat Bot Dietician Access", included: true },
                { name: "Chats per Month", value: <AutoText>Unlimited</AutoText> },
                { name: "Medication Alerts", included: true },
                { name: "Priority Support", included: true },
                { name: "Limited AI Support in Medication", included: true }
            ],
            popular: true
        },
        {
            id: "pro",
            name: <AutoText>Pro</AutoText>,
            price: "₹10000",
            color: "#8B5CF6",
            features: [
                { name: "AI Support", included: true },
                { name: "Diet Guidance", included: true },
                { name: "Chat Bot Dietician Access", included: true },
                { name: "Chats per Month", value: <AutoText>Unlimited</AutoText> },
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
                    <h2><AutoText>Choose Plan</AutoText></h2>
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
                                    <AutoText>Most Popular</AutoText>
                                </div>
                            )}

                            {currentPlan === plan.id && (
                                <div className="current-badge" style={{ backgroundColor: '#3B82F6' }}>
                                    <AutoText>Current Plan</AutoText>
                                </div>
                            )}

                            <div className="plan-header">
                                <h3 style={{ color: plan.color }}>{plan.name}</h3>
                                <div className="plan-price">
                                    <span className="price-amount">{plan.price}</span>
                                    <span className="price-period"><AutoText>/6month</AutoText></span>
                                </div>
                            </div>

                            <div className="plan-features">
                                <h4><AutoText>Features</AutoText></h4>
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
                                {currentPlan === plan.id ? <AutoText>Current Plan</AutoText> : <AutoText>Subscribe</AutoText>}
                                {currentPlan !== plan.id && <> {plan.price}<AutoText>/6month</AutoText></>}
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


export default function Navbar({
    activeTab,
    setActiveTab,
}) {
    const { t, language, setLanguage } = useLanguage();
    const [currentPlan, setCurrentPlan] = useState("premium");

    const [showPricing, setShowPricing] = useState(false);
    const [pricingButtonHover, setPricingButtonHover] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);


    const { logout } = useAuth();

    return (
        <>
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-brand">
                    <div className="logo-container">
                        {/* <h1>{t('dataletHealthcareDashboard')}</h1> */}
                        <h1>
                            <AutoText>DataletHealthcareTM Dashboard</AutoText>
                        </h1>
                    </div>
                </div>

                <div className="nav-menu">
                    <button
                        className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        {/* {t('dashboard')} */}
                        <AutoText>Dashboard</AutoText>
                    </button>
                    <button
                        className={`nav-tab ${activeTab === "patients" ? "active" : ""}`}
                        onClick={() => setActiveTab("patients")}
                    >
                        {/* {t('patients')} */}
                        <AutoText>Patients</AutoText>
                    </button>
                    <button
                        className={`nav-tab ${activeTab === "activity" ? "active" : ""}`}
                        onClick={() => setActiveTab("activity")}
                    >
                        {/* 🏃 Activity */}
                        <AutoText>🏃 Activity</AutoText>
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
                        {/* <span className="pricing-text">{t('pricing')}</span> */}
                        <span className="pricing-text">
                            <AutoText>Pricing</AutoText>
                        </span>

                        <span className="pricing-arrow">→</span>
                    </button>

                    <div className="language-selector">
                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="en">EN</option>
                            <option value="hi">HI</option>
                            <option value="bn">BN</option>
                            <option value="trp">KB</option>
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
                        {/* {t('dashboard')} */}
                        <AutoText>Dashboard</AutoText>
                    </button>
                    <button
                        className={`mobile-nav-tab ${activeTab === "patients" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("patients");
                            setMobileMenuOpen(false);
                        }}
                    >
                        {/* {t('patients')} */}
                        <AutoText>Patients</AutoText>
                    </button>
                    <button
                        className={`mobile-nav-tab ${activeTab === "activity" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("activity");
                            setMobileMenuOpen(false);
                        }}
                    >
                        {/* 🏃 Activity */}
                        <AutoText>🏃 Activity</AutoText>
                    </button>
                    <button
                        className={`mobile-nav-tab ${activeTab === "pricing" ? "active" : ""}`}
                        onClick={() => {
                            setShowPricing(true);
                            setActiveTab("pricing");
                            setMobileMenuOpen(false);
                        }}
                    >
                        {/* 💎 {t('pricing')} */}
                        <AutoText>💎 Pricing</AutoText>
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
                                {/* <span>👤</span> {t('profile')} */}
                                <AutoText>👤 Profile</AutoText>
                            </a>

                            <a href="#" className="mobile-account-link">
                                {/* <span>❓</span> {t('help')} */}
                                <AutoText>❓ Help</AutoText>
                            </a>
                            <button className="mobile-logout-btn" onClick={logout}>
                                {/* <span>🚪</span> {t('logout')} */}
                                <AutoText>🚪 Logout</AutoText>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
        
        <ProfileSection 
            isOpen={showProfile} 
            onClose={() => setShowProfile(false)} 
            t={t} 
        />
        <PricingModal 
            isOpen={showPricing} 
            onClose={() => setShowPricing(false)} 
            t={t}
            currentPlan={currentPlan}
        />
        </>
    );
}