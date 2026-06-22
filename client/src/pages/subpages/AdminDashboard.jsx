import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiUsers, FiSettings, FiBarChart2, FiTrash2, FiSlash, FiCheck, FiSave } from "react-icons/fi";

const AdminDashboard = () => {
  const [subTab, setSubTab] = useState("users"); // users, prompts, analytics
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  
  // Prompt states
  const [prompts, setPrompts] = useState({
    resumeAnalyzerPrompt: "",
    interviewGraderPrompt: "",
    assessmentGeneratorPrompt: "",
    roadmapGeneratorPrompt: ""
  });
  const [savingPrompts, setSavingPrompts] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await apiClient.get(`/admin/users?search=${search}`);
      setUsers(response.data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await apiClient.get("/admin/prompts");
      setPrompts(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get("/admin/analytics");
      setAnalytics(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (subTab === "users") fetchUsers();
    if (subTab === "prompts") fetchPrompts();
    if (subTab === "analytics") fetchAnalytics();
  }, [subTab, search]);

  const handleBlockUser = async (userId, currentBlockedStatus) => {
    try {
      // Toggle block status: simulated by updating DB
      const block = !currentBlockedStatus;
      await apiClient.put(`/admin/users/${userId}/block`, { block });
      toast.success(block ? "User blocked successfully" : "User unblocked successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user block status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;

    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSavePrompts = async (e) => {
    e.preventDefault();
    setSavingPrompts(true);
    try {
      await apiClient.put("/admin/prompts", prompts);
      toast.success("AI prompts templates updated!");
    } catch (err) {
      toast.error("Failed to save prompts configuration");
    } finally {
      setSavingPrompts(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic sub tab selectors */}
      <div className="flex border-b border-darkBorder pb-3 gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setSubTab("users")}
          className={`flex items-center gap-2 pb-2.5 transition-all ${
            subTab === "users" ? "text-rose-500 border-b-2 border-rose-500" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FiUsers /> User Administration
        </button>
        <button
          onClick={() => setSubTab("prompts")}
          className={`flex items-center gap-2 pb-2.5 transition-all ${
            subTab === "prompts" ? "text-rose-500 border-b-2 border-rose-500" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FiSettings /> AI Prompts tuning
        </button>
        <button
          onClick={() => setSubTab("analytics")}
          className={`flex items-center gap-2 pb-2.5 transition-all ${
            subTab === "analytics" ? "text-rose-500 border-b-2 border-rose-500" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FiBarChart2 /> System Telemetry
        </button>
      </div>

      {/* 1. USERS LIST VIEW */}
      {subTab === "users" && (
        <div className="glass-panel p-6 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="glass-input max-w-sm w-full text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loadingUsers ? (
            <div className="text-center py-6 text-slate-400 text-xs">Loading logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-darkBorder uppercase font-bold tracking-wider">
                    <th className="pb-3">Candidate name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBorder/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500 font-sans">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="text-slate-300 hover:bg-slate-800/10 transition-colors">
                        <td className="py-4.5 font-medium">{u.fullName}</td>
                        <td className="py-4.5">{u.email}</td>
                        <td className="py-4.5">{u.role}</td>
                        <td className="py-4.5 text-right space-x-3">
                          <button
                            onClick={() => handleBlockUser(u._id, u.isBlocked || false)}
                            className="text-amber-500 hover:underline font-semibold"
                          >
                            {u.isBlocked ? "Unblock" : "Block"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-danger hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. AI PROMPT MANAGEMENT VIEW */}
      {subTab === "prompts" && (
        <div className="glass-panel p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-white mb-6 Outfit">Prompts tuning</h3>
          <form onSubmit={handleSavePrompts} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Resume Scan Prompt context</label>
              <textarea
                value={prompts.resumeAnalyzerPrompt}
                onChange={(e) => setPrompts({ ...prompts, resumeAnalyzerPrompt: e.target.value })}
                className="w-full h-24 glass-input bg-[#0b0f19] resize-none leading-relaxed text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Interview Grader System prompt</label>
              <textarea
                value={prompts.interviewGraderPrompt}
                onChange={(e) => setPrompts({ ...prompts, interviewGraderPrompt: e.target.value })}
                className="w-full h-24 glass-input bg-[#0b0f19] resize-none leading-relaxed text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Aptitude MCQ Creator prompt</label>
              <textarea
                value={prompts.assessmentGeneratorPrompt}
                onChange={(e) => setPrompts({ ...prompts, assessmentGeneratorPrompt: e.target.value })}
                className="w-full h-24 glass-input bg-[#0b0f19] resize-none leading-relaxed text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPrompts}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <FiSave size={14} />
              {savingPrompts ? "Saving configurations..." : "Save Prompts Config"}
            </button>
          </form>
        </div>
      )}

      {/* 3. SYSTEM ANALYTICS VIEW */}
      {subTab === "analytics" && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <div className="glass-panel p-5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Users</span>
            <h3 className="text-3xl font-extrabold text-white mt-2 Outfit">{analytics.totalUsers}</h3>
            <p className="text-[10px] text-slate-500 mt-2 font-semibold">Registered students count</p>
          </div>

          <div className="glass-panel p-5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Users</span>
            <h3 className="text-3xl font-extrabold text-white mt-2 Outfit">{analytics.activeUsers}</h3>
            <p className="text-[10px] text-slate-500 mt-2 font-semibold">Estimated monthly logins</p>
          </div>

          <div className="glass-panel p-5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mock Exams</span>
            <h3 className="text-3xl font-extrabold text-white mt-2 Outfit">{analytics.assessmentsCompleted}</h3>
            <p className="text-[10px] text-slate-500 mt-2 font-semibold">Aptitude & Technical completed</p>
          </div>

          <div className="glass-panel p-5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Revenue</span>
            <h3 className="text-3xl font-extrabold text-white mt-2 Outfit">${analytics.revenue}</h3>
            <p className="text-[10px] text-slate-500 mt-2 font-semibold">Pro tier subscriptions value</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
