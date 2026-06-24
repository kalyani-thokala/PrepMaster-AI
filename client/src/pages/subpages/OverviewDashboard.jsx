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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const fetchReadinessAndStats = async () => {
      setLoading(true);
      try {
        const [readinessRes, statsRes, activitiesRes] = await Promise.all([
          apiClient.get("/roadmaps/readiness"),
          apiClient.get("/dashboard/stats"),
          apiClient.get("/notifications?page=1&limit=4")
        ]);
        setReadiness(readinessRes.data.data);
        setStats(statsRes.data.data);
        setActivities(activitiesRes.data.data.notifications || []);
      } catch (err) {
        console.error("Error reading dashboard data: ", err);
      } finally {
        setLoading(false);
        setActivitiesLoading(false);
      }
    };
    fetchReadinessAndStats();
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
            <span className="text-2xl font-bold text-secondary">#{stats?.leaderboardRank || readiness?.rank || 1}</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">🏆 Rank</p>
          </div>
        </div>
      </div>

      {/* METRICS GRID - MAIN CARD BLOCK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Resume ATS Score</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{readiness?.atsScore || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">{stats?.resumeAnalyses || 0} Uploaded Scans</p>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <FiFileText size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Aptitude Exams</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{stats?.avgAptitudeScore || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">{stats?.totalAptitudeTests || 0} Completed Tests</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <FiTrendingUp size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Coding Challenges</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{stats?.avgCodingScore || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">{stats?.totalCodingChallenges || 0} Submissions</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FiCode size={22} />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mock Interviews</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 Outfit">{readiness?.interviewReadiness || 0}%</h3>
            <p className="text-xs text-slate-400 mt-2">{stats?.interviewSessions || 0} Audio Sessions</p>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
            <FiMic size={22} />
          </div>
        </div>
      </div>

      {/* ADDITIONAL METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[#0b0f19]/40 border border-darkBorder p-4 rounded-xl text-center">
          <span className="text-xl font-bold text-white block">{stats?.totalTestsTaken || 0}</span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Tests Taken</span>
        </div>
        <div className="bg-[#0b0f19]/40 border border-darkBorder p-4 rounded-xl text-center">
          <span className="text-xl font-bold text-white block">{stats?.questionsAnswered || 0}</span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Questions Answered</span>
        </div>
        <div className="bg-[#0b0f19]/40 border border-darkBorder p-4 rounded-xl text-center">
          <span className="text-xl font-bold text-white block">{stats?.accuracyPercentage || 0}%</span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Accuracy Percentage</span>
        </div>
        <div className="bg-[#0b0f19]/40 border border-darkBorder p-4 rounded-xl text-center">
          <span className="text-xl font-bold text-white block">{stats?.roadmapsGenerated || 0}</span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Roadmaps Created</span>
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

        {/* Weekly & Monthly Learning Activity Charts */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h4 className="text-base font-bold text-white mb-6 Outfit">Weekly Prep Activity Curve</h4>
          <div className="h-64 flex flex-col justify-center">
            {stats?.weeklyActivity && stats.weeklyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyActivity}>
                  <defs>
                    <linearGradient id="colorAptitude" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#1e293b", color: "#f8fafc" }} />
                  <Area type="monotone" dataKey="aptitude" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorAptitude)" name="Aptitude Tests" />
                  <Area type="monotone" dataKey="coding" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCoding)" name="Coding Challenges" />
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

          {/* Skill Improvement Trend Widget */}
          <div className="glass-panel p-6">
            <h4 className="text-base font-bold text-white mb-4 Outfit flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" />
              Skill Improvement Trend
            </h4>
            <div className="space-y-3">
              {stats?.skillImprovementTrend && stats.skillImprovementTrend.length > 0 ? (
                stats.skillImprovementTrend.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">{item.skill}</span>
                      <span className="text-primary font-bold">{item.score}% Avg</span>
                    </div>
                    <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-darkBorder">
                      <div className="bg-gradient-to-r from-primary to-secondary h-full" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Complete exams to view your skill improvement indicators.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT ATTEMPTS LOG */}
        <div className="glass-panel p-6">
          <h4 className="text-base font-bold text-white mb-4 Outfit flex items-center gap-2">
            <FiActivity className="text-secondary" />
            Recently Attempted Tests
          </h4>
          <div className="space-y-4">
            {stats?.recentTests && stats.recentTests.length > 0 ? (
              stats.recentTests.map((test) => {
                const isAptitude = test.type === "Aptitude";
                return (
                  <div key={test._id} className="flex items-start gap-3 pb-3.5 border-b border-darkBorder/40 last:border-0 last:pb-0 animate-fade-in">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      isAptitude ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {isAptitude ? <FiTrendingUp size={15} /> : <FiCode size={15} />}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-white">{test.title}</p>
                        <span className={`text-[10px] font-bold ${test.score >= 70 ? "text-success" : test.score >= 40 ? "text-warning" : "text-danger"}`}>
                          Score: {test.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Difficulty: <span className="font-semibold">{test.difficulty}</span> | Type: {test.type}
                      </p>
                      <span className="text-[9px] text-slate-500 font-sans">{new Date(test.date).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs font-sans">
                No recent attempts recorded. Start an aptitude test or coding challenge to populate this list.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
