import React, { createContext, useEffect, useMemo, useState, useRef } from "react";
import {
  auth,
  googleProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth";
import { createUserDocument, getUserProfile, updateUserProfile } from "../services/firestoreService.js";

const AuthContext = createContext(null);

const FIREBASE_ERROR_TRANSLATIONS = {
  "auth/invalid-api-key": "Invalid Firebase API key. Check your environment variables.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "Your account has been disabled.",
  "auth/user-not-found": "No account found for that email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "This email is already registered.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/popup-closed-by-user": "Google sign-in popup was closed before completion.",
  "auth/cancelled-popup-request": "Google sign-in request was cancelled.",
  "auth/network-request-failed": "Network request failed. Check your connection and try again."
};

function mapFirebaseError(error) {
  if (!error || !error.code) {
    return "An unexpected Firebase error occurred.";
  }

  return FIREBASE_ERROR_TRANSLATIONS[error.code] || error.message || "Firebase authentication failed.";
}

async function setAuthPersistence(rememberMe) {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Firebase persistence error:", error);
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const isRegisteringRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isRegisteringRef.current) {
        return;
      }
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid).catch(() => null);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          profile
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

// useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//     console.log("Firebase Auth State Changed:", firebaseUser);

//     try {
//       if (firebaseUser) {
//         const profile = await getUserProfile(firebaseUser.uid).catch(() => null);

//         const userData = {
//           uid: firebaseUser.uid,
//           email: firebaseUser.email,
//           displayName: firebaseUser.displayName,
//           photoURL: firebaseUser.photoURL,
//           profile
//         };

//         console.log("Setting User:", userData);

//         setUser(userData);
//       } else {
//         console.log("No Firebase User Found");
//         setUser(null);
//       }
//     } catch (error) {
//       console.error("Auth State Error:", error);
//       setUser(null);
//     } finally {
//       setAuthLoading(false);
//     }
//   });

//   return () => unsubscribe();
// }, []);

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signUpWithEmail = async (email, password, displayName, rememberMe = true) => {
    setAuthLoading(true);
    setAuthError(null);
    isRegisteringRef.current = true;

    try {
      await setAuthPersistence(rememberMe);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      await firebaseUpdateProfile(firebaseUser, { displayName });
      await createUserDocument(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email,
        displayName,
        createdAt: new Date().toISOString()
      });

      const profile = await getUserProfile(firebaseUser.uid).catch(() => null);
      const newUserState = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName,
        photoURL: firebaseUser.photoURL,
        profile
      };
      
      // Disable auto-login: sign out immediately after registration
      await signOut(auth);

      return {
        success: true,
        user: newUserState
      };
    } catch (error) {
      try {
        await signOut(auth);
      } catch (_) {}
      const message = mapFirebaseError(error);
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      isRegisteringRef.current = false;
      setUser(null);
      setAuthLoading(false);
    }
  };

  const loginWithEmail = async (email, password, rememberMe = true) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await setAuthPersistence(rememberMe);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      const profile = await getUserProfile(firebaseUser.uid).catch(() => null);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        profile
      });

      return { success: true, user: firebaseUser };
    } catch (error) {
      const message = mapFirebaseError(error);
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogle = async (rememberMe = true) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await setAuthPersistence(rememberMe);
      console.log("Step 1: Google popup opened");
      const credential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = credential.user;
      console.log("Step 2: Firebase authentication successful");
      console.log("Step 3: User data received", firebaseUser);
      await createUserDocument(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date().toISOString()
      });
      const profile = await getUserProfile(firebaseUser.uid).catch(() => null);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        profile
      });

      return { success: true, user: firebaseUser };
    } catch (error) {
      const message = mapFirebaseError(error);
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/#/login`
      });
      return { success: true };
    } catch (error) {
      const message = mapFirebaseError(error);
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await signOut(auth);
      localStorage.removeItem("prepmaster-access-token");
      setUser(null);
      return { success: true };
    } catch (error) {
      const message = mapFirebaseError(error);
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    setAuthLoading(true);
    setAuthError(null);

    if (!user?.uid) {
      const message = "Unable to update profile without a valid authenticated user.";
      setAuthError(message);
      setAuthLoading(false);
      return { success: false, error: message };
    }

    try {
      await updateUserProfile(user.uid, updates);
      const refreshedProfile = await getUserProfile(user.uid);
      setUser((current) => ({
        ...current,
        profile: refreshedProfile
      }));
      return { success: true, data: refreshedProfile };
    } catch (error) {
      const message = mapFirebaseError(error);
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      authLoading,
      authError,
      clearAuthError,
      signUpWithEmail,
      loginWithEmail,
      loginWithGoogle,
      resetPassword,
      logout,
      updateProfile
    }),
    [user, authLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
