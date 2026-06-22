import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useUiStore } from "../store/uiStore.js";
import { FiMenu, FiBell, FiLogOut, FiUser, FiActivity } from "react-icons/fi";
import toast from "react-hot-toast";
import apiClient from "../services/api.js";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, activeTab, setActiveTab } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  const userName = user?.displayName || user?.profile?.displayName || user?.email || "User";
  const userRole = user?.profile?.role || user?.role || "Candidate";

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.warn("Failed clearing backend cookie session:", err);
    }
    localStorage.removeItem("prepmaster-access-token");
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Convert tab names to clean title
  const getPageTitle = () => {
    if (location.pathname === "/profile") return "Profile Settings";
    switch (activeTab) {
      case "dashboard": return "Overview Dashboard";
      case "resume": return "Resume SWOT Analyzer";
      case "interview": return "AI Interview Arena";
      case "coding": return "LeetCode Practise Suite";
      case "aptitude": return "MCQ Assessments Portal";
      case "coach": return "AI Career Advisor";
      case "roadmap": return "Interactive Career Milestones";
      case "admin": return "Control Hub Console";
      case "leaderboard": return "Leaderboard & XP Standings";
      case "company": return "Company Prep Guide";
      case "notifications": return "Alert Notifications Inbox";
      default: return "Placement Ecosystem";
    }
  };

  return (
    <header className="glass-panel backdrop-blur-lg border-b border-darkBorder sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-background/50 rounded-none">
      {/* Sidebar toggle button */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-card/50"
        >
          <FiMenu size={22} />
        </button>
        <h1 className="text-xl font-bold text-text tracking-wide Outfit">
          {getPageTitle()}
        </h1>
      </div>

      {/* User metrics & profile info */}
      <div className="flex items-center gap-6">
        {/* Streak counter */}
        {user?.streak !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full text-xs font-semibold">
            <span>🔥</span>
            <span>{user.streak} Day Streak</span>
          </div>
        )}

        {/* Readiness Index */}
        {user?.readinessScore !== undefined && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-semibold">
            <FiActivity size={14} className="animate-pulse" />
            <span>Readiness: {user.readinessScore}%</span>
          </div>
        )}

        {/* Alert Notifications */}
        <button
          onClick={() => { setActiveTab("notifications"); navigate("/dashboard"); }}
          className="relative text-slate-400 hover:text-text transition-colors p-1.5 rounded-lg hover:bg-card/50"
        >
          <FiBell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
        </button>

        {/* User avatar & info */}
        <div className="flex items-center gap-3 border-l border-darkBorder pl-6">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-semibold text-text">{userName}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">{userRole}</span>
          </div>
          
          <div className="relative group">
            <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-bold text-sm shadow-md">
              {userName[0].toUpperCase()}
            </button>

            {/* Hover actions menu */}
            <div className="absolute right-0 mt-2 w-48 bg-card border border-darkBorder rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 py-1">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <FiUser size={16} />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left"
              >
                <FiLogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
