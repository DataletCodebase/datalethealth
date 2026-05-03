import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA-s5OdvDEUZEq3g3ogQ3LCd_yYw0Jc8NY",
  authDomain: "datalet-health.firebaseapp.com",
  projectId: "datalet-health",
  storageBucket: "datalet-health.firebasestorage.app",
  messagingSenderId: "296961451872",
  appId: "1:296961451872:web:47ad3566f719c3ed6f2005",
  measurementId: "G-KZ9BRH5QVG"
};

const app = initializeApp(firebaseConfig);
let analytics;
try {
  analytics = getAnalytics(app);
} catch (err) {
  console.warn("Firebase Analytics could not be initialized:", err);
}

export default app;