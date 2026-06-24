import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import apiClient from "../services/api.js";
import toast from "react-hot-toast";

export const ProtectedRoute = () => {
  const { user, authLoading } = useAuth();
  const [syncLoading, setSyncLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to continue");
    }
  }, [user, authLoading]);

  useEffect(() => {
    const syncSessionWithBackend = async () => {
      if (authLoading) return;
      if (!user) {
        setSyncLoading(false);
        return;
      }

      try {
        // 1. Verify if backend session is already active
        await apiClient.get("/auth/me", { skipAuthRefresh: true });
        console.log("Step 4: Token stored");
        console.log("Step 5: Candidate synchronized");
        console.log("Step 6: Authentication state updated");
        console.log("Step 7: Redirected to Dashboard");
        setSyncLoading(false);
      } catch (err) {
        // If unauthorized (401), we need to establish the backend JWT session
        if (err.response?.status === 401 || err.response?.status === 400) {
          const credentials = {
            email: user.email,
            password: `Firebase_${user.uid}`,
            rememberMe: true
          };

          try {
            // 2. Try logging in
            const loginRes = await apiClient.post("/auth/login", credentials, { skipAuthRefresh: true });
            const { accessToken } = loginRes.data.data;
            localStorage.setItem("prepmaster-access-token", accessToken);
            console.log("Step 4: Token stored");
            console.log("Step 5: Candidate synchronized");
            console.log("Step 6: Authentication state updated");
            console.log("Step 7: Redirected to Dashboard");
            setSyncLoading(false);
          } catch (loginErr) {
            // 3. If user doesn't exist on backend (404), register first
            if (loginErr.response?.status === 404) {
              try {
                await apiClient.post("/auth/register", {
                  fullName: user.displayName || user.email.split("@")[0],
                  email: user.email,
                  password: credentials.password,
                  confirmPassword: credentials.password
                }, { skipAuthRefresh: true });

                // Login again after registration
                const retryRes = await apiClient.post("/auth/login", credentials, { skipAuthRefresh: true });
                const { accessToken } = retryRes.data.data;
                localStorage.setItem("prepmaster-access-token", accessToken);
                console.log("Step 4: Token stored");
                console.log("Step 5: Candidate synchronized");
                console.log("Step 6: Authentication state updated");
                console.log("Step 7: Redirected to Dashboard");
                setSyncLoading(false);
              } catch (regErr) {
                console.error("Backend registration sync failed:", regErr);
                const detail = regErr.response?.data?.message || regErr.message;
                setSyncError(`Failed to synchronize your candidate account on the server. (Detail: ${detail})`);
                setSyncLoading(false);
              }
            } else {
              console.error("Backend login sync failed:", loginErr);
              const detail = loginErr.response?.data?.message || loginErr.message;
              setSyncError(`Unable to establish a secure database session. (Detail: ${detail})`);
              setSyncLoading(false);
            }
          }
        } else {
          console.error("Backend communication failed:", err);
          const detail = err.response?.data?.message || err.message;
          setSyncError(`Server connection offline. Please check your network. (Detail: ${detail})`);
          setSyncLoading(false);
        }
      }
    };

    syncSessionWithBackend();
  }, [user, authLoading]);

  if (authLoading || (user && syncLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text animate-fade-in">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold tracking-wider animate-pulse">
          Synchronizing PrepMaster Cloud Sync...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (syncError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sync Error</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">{syncError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <Outlet />;
};