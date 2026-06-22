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
  apiKey: "your_firebase_api_key_placeholder",
  authDomain: "your_firebase_auth_domain_placeholder",
  projectId: "your_firebase_project_id_placeholder",
  storageBucket: "your_firebase_storage_bucket_placeholder",
  messagingSenderId: "your_firebase_messaging_sender_id_placeholder",
  appId: "your_firebase_app_id_placeholder",
  measurementId: "your_firebase_measurement_id_placeholder"
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
  const allEnvVarsPresent = requiredEnvVars.every((key) => Boolean(import.meta.env[key]));
  const someEnvVarsPresent = requiredEnvVars.some((key) => Boolean(import.meta.env[key]));

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

  if (someEnvVarsPresent) {
    const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);
    throw new Error(
      `Firebase initialization failed because the following environment variables are missing: ${missing.join(", ")}`
    );
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
