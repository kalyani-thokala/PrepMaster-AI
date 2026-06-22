import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Please enter your email.");
    }

    setLoading(true);
    const response = await resetPassword(email);
    setLoading(false);

    if (response.success) {
      toast.success("Password reset email sent. Check your inbox.");
      navigate("/login");
    } else {
      toast.error(response.error || "Failed to send password reset email.");
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
          <h2 className="text-xl font-semibold text-white mt-4 Outfit">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your email and we&apos;ll send a secure reset link.</p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 transition-all mt-2"
          >
            {loading ? "Sending reset email..." : "Send Reset Email"}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
