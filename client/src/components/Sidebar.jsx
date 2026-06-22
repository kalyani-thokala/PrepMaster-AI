import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useUiStore } from "../store/uiStore.js";
import { Link, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiFileText,
  FiMic,
  FiCode,
  FiMessageCircle,
  FiMap,
  FiShield,
  FiList,
  FiChevronLeft,
  FiTarget,
  FiAward,
  FiBell
} from "react-icons/fi";

const Sidebar = () => {
  const { user } = useAuth();
  const { sidebarOpen, activeTab, setActiveTab, setSidebar } = useUiStore();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Overview Dashboard", icon: FiGrid },
    { id: "resume", label: "Resume Optimizer", icon: FiFileText },
    { id: "interview", label: "AI Interview Arena", icon: FiMic },
    { id: "coding", label: "Coding Practice", icon: FiCode },
    { id: "aptitude", label: "Aptitude Tests", icon: FiList },
    { id: "coach", label: "AI Career Coach", icon: FiMessageCircle },
    { id: "roadmap", label: "Learning Roadmap", icon: FiMap },
    { id: "leaderboard", label: "Leaderboard & XP", icon: FiAward },
    { id: "company", label: "Company Prep", icon: FiTarget },
    { id: "notifications", label: "Notifications", icon: FiBell }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate("/dashboard"); // All sub-pages run dynamically on dashboard layout
  };

  return (
    <aside
      className={`glass-panel border-r border-darkBorder bg-background h-screen sticky top-0 flex flex-col z-40 rounded-none transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Brand Header Logo */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-darkBorder">
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-white font-bold text-lg flex-shrink-0">
            P
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wider Outfit">
              PrepMaster
            </span>
          )}
        </Link>
        {sidebarOpen && (
          <button
            onClick={() => setSidebar(false)}
            className="text-slate-400 hover:text-text p-1 hover:bg-card/50 rounded-lg hidden sm:block"
          >
            <FiChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav Menu Lists */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary text-primary"
                  : "text-slate-400 hover:bg-card/50 hover:text-text"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Admin Dashboard - conditional display */}
        {(user?.role === "Admin" || user?.role === "Super Admin") && (
          <button
            onClick={() => handleTabClick("admin")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold border-t border-darkBorder/60 pt-4 mt-4 transition-all duration-200 ${
              activeTab === "admin"
                ? "bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-l-4 border-rose-500 text-rose-400"
                : "text-slate-400 hover:bg-card/50 hover:text-text"
            }`}
          >
            <FiShield size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Admin Control Hub</span>}
          </button>
        )}
      </nav>

      {/* Sidebar Footer info */}
      {sidebarOpen && (
        <div className="p-4 border-t border-darkBorder text-center">
          <p className="text-xs text-slate-500">PrepMaster AI © 2026</p>
          <p className="text-[10px] text-primary font-semibold mt-0.5 tracking-wider">ENTERPRISE EDITION</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
