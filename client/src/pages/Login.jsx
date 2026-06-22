import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const { user, loginWithEmail, loginWithGoogle, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.registered) {
      setShowSuccessAlert(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please enter email and password.");
    }

    const response = await loginWithEmail(email, password, rememberMe);
    // if (response.success) {
    //   toast.success("Signed in successfully.");
    //   navigate("/dashboard");
    // }
    if (response.success) {
  console.log("Login Success");
  console.log("User:", response.user);

  toast.success("Signed in successfully.");

  setTimeout(() => {
    navigate("/dashboard");
  }, 300);
}
     else {
      toast.error(response.error);
    }
  };

  const handleGoogleSignIn = async () => {
    const response = await loginWithGoogle(rememberMe);
    if (response.success) {
      toast.success("Signed in with Google successfully.");
      navigate("/dashboard");
    } else {
      toast.error(response.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 relative">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wider Outfit inline-block">
            PrepMaster AI
          </Link>
          <h2 className="text-xl font-semibold text-white mt-4 Outfit">Sign in to your account</h2>
          <p className="text-xs text-slate-400 mt-1">Securely access your candidate dashboard.</p>
        </div>

        {showSuccessAlert && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Registration complete! Please sign in to access your dashboard.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              className="w-full glass-input"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="w-full glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="w-4 h-4 rounded border-darkBorder bg-[#0b0f19] text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="text-xs text-slate-400 ml-2.5 font-medium cursor-pointer">
              Keep me signed in
            </label>
          </div>

          {authError && <p className="text-xs text-rose-400 text-center font-medium">{authError}</p>}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
          >
            {authLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          className="w-full py-3.5 mt-3 border border-slate-700 text-white rounded-xl hover:border-primary transition-all"
        >
          {authLoading ? "Please wait..." : "Continue with Google"}
        </button>

        <p className="text-xs text-slate-400 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
