import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const { user, signUpWithEmail, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!displayName || !email || !password || !confirmPassword) {
      return toast.error("Please fill in all fields.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    const response = await signUpWithEmail(email, password, displayName, rememberMe);
    if (response.success) {
      toast.success("Registration complete! Please sign in.");
      navigate("/login", { state: { registered: true } });
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
          <h2 className="text-xl font-semibold text-white mt-4 Outfit">Create your account</h2>
          <p className="text-xs text-slate-400 mt-1">Sign up with Firebase Auth and start your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              className="w-full glass-input"
              placeholder="e.g. John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              className="w-full glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full glass-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
          >
            {authLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
