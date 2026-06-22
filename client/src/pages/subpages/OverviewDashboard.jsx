import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../store/uiStore.js";
import apiClient from "../../services/api.js";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { FiTrendingUp, FiCheckCircle, FiFileText, FiCode, FiMic, FiAward, FiStar, FiActivity, FiClock } from "react-icons/fi";

const OverviewDashboard = () => {
  const { user } = useAuth();
  const { setActiveTab } = useUiStore();
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const fetchReadinessAndActivities = async () => {
      setLoading(true);
      try {
        const [readinessRes, activitiesRes] = await Promise.all([
          apiClient.get("/roadmaps/readiness"),
          apiClient.get("/notifications?page=1&limit=4")
        ]);
        setReadiness(readinessRes.data.data);
        setActivities(activitiesRes.data.data.notifications || []);
      } catch (err) {
        console.error("Error reading dashboard data: ", err);
      } finally {
        setLoading(false);
        setActivitiesLoading(false);
      }
    };
    fetchReadinessAndActivities();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER HERO SUMMARY */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-primary/10 via-secondary/5 to-card/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white Outfit">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Placement readiness index is computed from mock tests and resume strengths. Complete roadmaps to raise stats.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center bg-[#0b0f19] px-4 py-3 rounded-xl border border-darkBorder min-w-[100px]">
            <span className="text-2xl font-bold text-primary">{user?.streak || 0}</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">🔥 Streak</p>
          </div>
          <div className="text-center bg-[#0b0f19] px-4 py-3 rounded-xl border border-darkBorder min-w-[100px]">
            <span className="text-2xl font-bold text-secondary">#{readiness?.rank || 1}</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">🏆 Rank</p>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Resume Score</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{readiness?.atsScore || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">SWOT analysis synced</p>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <FiFileText size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Aptitude Score</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{readiness?.aptitudeReadiness || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">Quantitative & logical reviews</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <FiTrendingUp size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Coding Score</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{readiness?.codingReadiness || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">Languages compiled OK</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FiCode size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Interview Score</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{readiness?.interviewReadiness || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">Accuracy & speech evaluated</p>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
            <FiMic size={22} />
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Placement Readiness Index Gauge */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <h4 className="text-base font-bold text-white mb-6 self-start Outfit">Overall Placement Readiness</h4>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Simple circular gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (readiness?.overallReadiness || 0)) / 100}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white Outfit">{readiness?.overallReadiness || 0}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Readiness Index</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-6 max-w-[240px]">
            {readiness?.overallReadiness >= 80 
              ? "Excellent! You are highly competitive and ready to crack placement hiring rounds."
              : "Keep practicing. Take more quantitative aptitude tests and mock interview sessions."}
          </p>
        </div>

        {/* Weekly MCQ & Interview Trends */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h4 className="text-base font-bold text-white mb-6 Outfit">Weekly Learning Curves</h4>
          <div className="h-64 flex flex-col justify-center">
            {readiness && (readiness.codingReadiness > 0 || readiness.aptitudeReadiness > 0 || readiness.interviewReadiness > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: "Initial", coding: 0, aptitude: 0, interview: 0 },
                  { name: "Current Status", coding: readiness.codingReadiness, aptitude: readiness.aptitudeReadiness, interview: readiness.interviewReadiness }
                ]}>
                  <defs>
                    <linearGradient id="colorAptitude" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInterview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#1e293b", color: "#f8fafc" }} />
                  <Area type="monotone" dataKey="aptitude" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorAptitude)" name="Aptitude" />
                  <Area type="monotone" dataKey="interview" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorInterview)" name="Interview" />
                  <Area type="monotone" dataKey="coding" stroke="#10B981" strokeWidth={2} fillOpacity={1} name="Coding" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-xs leading-relaxed max-w-sm mx-auto font-sans">
                No learning progress data available yet. Please complete MCQ assessments or conduct mock interviews to populate your analytics charts.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DUAL WIDGETS COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: ACTIONS & SUGGESTIONS */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h4 className="text-base font-bold text-white mb-4 Outfit flex items-center gap-2">
              <FiStar className="text-amber-500" />
              AI Priority Action Strategy
            </h4>
            <div className="space-y-3">
              {readiness?.recommendedActions && readiness.recommendedActions.length > 0 ? (
                readiness.recommendedActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 bg-[#0b0f19]/40 p-4 rounded-xl border border-darkBorder">
                    <FiCheckCircle className="text-primary mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{action}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-3.5 bg-[#0b0f19]/40 p-4 rounded-xl border border-darkBorder">
                    <FiCheckCircle className="text-primary mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Go to <button onClick={() => setActiveTab("resume")} className="text-primary font-semibold hover:underline">Resume Optimizer</button> to scan your resume details.
                    </p>
                  </div>
                  <div className="flex items-start gap-3.5 bg-[#0b0f19]/40 p-4 rounded-xl border border-darkBorder">
                    <FiCheckCircle className="text-primary mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Practise standard coding patterns on the <button onClick={() => setActiveTab("coding")} className="text-primary font-semibold hover:underline">Coding Practice</button> platform.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Suggestions Widget */}
          <div className="glass-panel p-6 bg-gradient-to-br from-indigo-500/5 to-transparent">
            <h4 className="text-base font-bold text-white mb-4 Outfit flex items-center gap-2">
              <FiAward className="text-primary" />
              AI Suggestions Profile Tips
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((skill, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#0b0f19]/30 p-3 rounded-lg border border-darkBorder/40">
                    💻 <span className="font-semibold text-white">{skill}:</span> Verified in profile database. Practice coding challenges for this skill.
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2 bg-[#0b0f19]/30 p-3 rounded-lg border border-darkBorder/40">
                  💡 <span className="font-semibold text-white">Profile:</span> No skills verified yet. Scan your resume or generate a roadmap to populate profile suggestions.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT ACTIVITY FEED */}
        <div className="glass-panel p-6">
          <h4 className="text-base font-bold text-white mb-4 Outfit flex items-center gap-2">
            <FiActivity className="text-secondary" />
            Recent Activity Log
          </h4>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="text-slate-400 text-xs text-center py-8">Loading activities...</div>
            ) : activities.length > 0 ? (
              activities.map((act) => {
                const isResume = act.title.toLowerCase().includes("resume");
                const isCode = act.title.toLowerCase().includes("code") || act.title.toLowerCase().includes("challenge");
                const isAward = act.title.toLowerCase().includes("achievement") || act.title.toLowerCase().includes("badge");
                
                return (
                  <div key={act._id} className="flex items-start gap-3 pb-3.5 border-b border-darkBorder/40 last:border-0 last:pb-0 animate-fade-in">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      isResume ? "bg-primary/10 text-primary" :
                      isCode ? "bg-rose-500/10 text-rose-400" :
                      isAward ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {isResume ? <FiFileText size={15} /> :
                       isCode ? <FiCode size={15} /> :
                       isAward ? <FiAward size={15} /> : <FiMic size={15} />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-white">{act.title}</p>
                      <p className="text-[10px] text-slate-400 font-sans">{act.message}</p>
                      <span className="text-[9px] text-slate-500 font-sans">{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs font-sans">
                No recent activity found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
