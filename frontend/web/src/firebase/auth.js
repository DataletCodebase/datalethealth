// import app from "./firebaseConfig";
// import {
//     getAuth,
//     RecaptchaVerifier,
//     signInWithPhoneNumber,
// } from "firebase/auth";

// export const auth = getAuth(app);

// let confirmationResult = null;

// // Setup Recaptcha (Invisible)
// export const setupRecaptcha = () => {
//     if (!window.recaptchaVerifier) {
//         window.recaptchaVerifier = new RecaptchaVerifier(
//             "recaptcha-container",
//             {
//                 size: "invisible",
//             },
//             auth
//         );
//     }
// };

// // Send OTP
// export const sendPhoneOTP = async (phoneNumber) => {
//     try {
//         setupRecaptcha();

//         const appVerifier = window.recaptchaVerifier;

//         confirmationResult = await signInWithPhoneNumber(
//             auth,
//             phoneNumber,
//             appVerifier
//         );

//         return true;
//     } catch (error) {
//         console.error("Send OTP Error:", error);
//         throw error;
//     }
// };

// // Verify OTP
// export const verifyPhoneOTP = async (otp) => {
//     try {
//         const result = await confirmationResult.confirm(otp);
//         return result.user;
//     } catch (error) {
//         console.error("Verify OTP Error:", error);
//         throw error;
//     }
// };


import app from "./firebaseConfig";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";

export const auth = getAuth(app);

let confirmationResult = null;

export const setupRecaptcha = () => {
    if (window.recaptchaVerifier) return;

    window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
            size: "invisible",
        }
    );
};

export const sendPhoneOTP = async (phoneNumber) => {
    try {
        setupRecaptcha();

        const appVerifier = window.recaptchaVerifier;

        confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            appVerifier
        );

        return true;
    } catch (error) {
        console.error("Send OTP Error:", error);
        throw error;
    }
};

export const verifyPhoneOTP = async (otp) => {
    try {
        const result = await confirmationResult.confirm(otp);
        return result.user;
    } catch (error) {
        console.error("Verify OTP Error:", error);
        throw error;
    }
};