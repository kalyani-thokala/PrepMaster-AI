import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const defaultFirebaseConfig = {
  apiKey: "AIzaSyCBkV9nS2wE9HujrKLAe4J-aKZupSrVWdg",
  authDomain: "prepmasterai-b2e06.firebaseapp.com",
  projectId: "prepmasterai-b2e06",
  storageBucket: "prepmasterai-b2e06.firebasestorage.app",
  messagingSenderId: "270131420225",
  appId: "1:270131420225:web:69148f640e771a41897ac0",
  measurementId: "G-ZCZZ6YV68Z"
};

const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
];

function getFirebaseConfig() {
  const allEnvVarsPresent = requiredEnvVars.every((key) => {
    const val = import.meta.env[key];
    return Boolean(val && !val.includes("placeholder"));
  });

  if (allEnvVarsPresent) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId
    };
  }

  return defaultFirebaseConfig;
}

function initializeFirebaseApp() {
  const config = getFirebaseConfig();

  if (!getApps().length) {
    return initializeApp(config);
  }

  return getApps()[0];
}

const firebaseApp = initializeFirebaseApp();
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
let analytics = null;

isSupported().then((supported) => {
  if (supported) {
    try {
      analytics = getAnalytics(firebaseApp);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Firebase Analytics initialization failed:", error);
      }
    }
  }
});

const googleProvider = new GoogleAuthProvider();

export {
  auth,
  firestore,
  analytics,
  googleProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
};
