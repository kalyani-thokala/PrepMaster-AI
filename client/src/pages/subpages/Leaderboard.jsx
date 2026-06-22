import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiAward, FiUser, FiZap, FiCheckCircle, FiLock } from "react-icons/fi";

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [currentUserStats, setCurrentUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Standard predefined badges list for candidates
  const ALL_BADGES = [
    { id: "first_resume", title: "Resume Spark", description: "Successfully scanned your first resume.", icon: "📄" },
    { id: "first_assessment", title: "Quiz Starter", description: "Completed your first MCQ assessment test.", icon: "⚡" },
    { id: "first_interview", title: "First Words", description: "Completed your first mock interview.", icon: "🎙️" },
    { id: "streak_7", title: "Relentless Week", description: "Achieved a 7-day placement prep streak.", icon: "🔥" },
    { id: "streak_30", title: "Prep Master", description: "Maintained a 30-day coding prep streak.", icon: "🏆" },
    { id: "coding_champion", title: "Code Champion", description: "Compiled code successfully with 100% test cases passed.", icon: "💻" },
    { id: "readiness_80", title: "Elite Readiness", description: "Reached an overall readiness score above 80%.", icon: "🚀" }
  ];

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/leaderboard?page=${page}&limit=10`);
      setRankings(response.data.data.rankings);
      setCurrentUserStats(response.data.data.currentUserStats);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [page]);

  // Helper check to see if badge is unlocked based on Mongoose user achievements titles
  const isBadgeUnlocked = (badgeTitle) => {
    if (!currentUserStats?.achievements) return false;
    return currentUserStats.achievements.some(
      (a) => a.title.toLowerCase().trim() === badgeTitle.toLowerCase().trim()
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER HERO AREA */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-rose-500/10 via-orange-500/5 to-card/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white Outfit">
            Achievements & Leaderboard
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Compete with candidates globally. Unlock achievements by completing roadmaps, compiling code, and acing mock interviews.
          </p>
        </div>

        {currentUserStats && (
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="text-center bg-[#0b0f19] px-5 py-4 rounded-2xl border border-darkBorder min-w-[120px] shadow-glow">
              <span className="text-3xl font-extrabold text-rose-400 Outfit">#{currentUserStats.rank}</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Your Rank</p>
            </div>
            <div className="text-center bg-[#0b0f19] px-5 py-4 rounded-2xl border border-darkBorder min-w-[120px] shadow-glow">
              <span className="text-3xl font-extrabold text-orange-400 Outfit">{currentUserStats.readinessScore}%</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Readiness</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: GLOBAL LEADERBOARD RANK LIST */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white Outfit flex items-center gap-2 border-b border-darkBorder pb-3">
              <FiAward className="text-rose-500" /> Candidate Standings
            </h3>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">Syncing rankings...</div>
            ) : rankings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 border-b border-darkBorder uppercase font-bold tracking-wider">
                      <th className="pb-3 text-center w-12">Rank</th>
                      <th className="pb-3 pl-4">Candidate Name</th>
                      <th className="pb-3 text-center">Readiness Index</th>
                      <th className="pb-3 text-center">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBorder/60">
                    {rankings.map((u, index) => {
                      const absoluteRank = (page - 1) * 10 + index + 1;
                      const isSelf = currentUserStats && u.fullName === currentUserStats.fullName; // Simple representation check
                      return (
                        <tr
                          key={u._id}
                          className={`hover:bg-slate-800/10 transition-colors ${
                            absoluteRank === 1
                              ? "text-amber-400 font-semibold bg-amber-500/5"
                              : absoluteRank === 2
                              ? "text-slate-300 font-semibold"
                              : absoluteRank === 3
                              ? "text-amber-600 font-semibold"
                              : "text-slate-300"
                          }`}
                        >
                          <td className="py-4 text-center font-bold">
                            {absoluteRank === 1 ? "🥇" : absoluteRank === 2 ? "🥈" : absoluteRank === 3 ? "🥉" : `#${absoluteRank}`}
                          </td>
                          <td className="py-4 pl-4 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center font-bold text-xs text-white">
                              {u.fullName[0].toUpperCase()}
                            </div>
                            <div>
                              <span>{u.fullName}</span>
                              {isSelf && <span className="ml-2 text-[9px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-md">You</span>}
                            </div>
                          </td>
                          <td className="py-4 text-center font-bold font-sans">{u.readinessScore}%</td>
                          <td className="py-4 text-center font-bold font-sans flex items-center justify-center gap-1">
                            <FiZap className="text-amber-500" size={13} /> {u.streak}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No rankings registered.</p>
            )}
          </div>

          {/* PAGINATION SWITCHERS */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-darkBorder/60 pt-4 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-darkBorder rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border border-darkBorder rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRESETS BADGES / TROPHY GRILL */}
        <div className="glass-panel p-6 lg:col-span-1 space-y-6">
          <h3 className="text-base font-bold text-white Outfit flex items-center gap-2 border-b border-darkBorder pb-3">
            🏆 Badge Cabinet
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {ALL_BADGES.map((b) => {
              const unlocked = isBadgeUnlocked(b.title);
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    unlocked
                      ? "bg-success/5 border-success/20 text-text"
                      : "bg-[#0b0f19]/40 border-darkBorder/60 text-slate-500 opacity-60"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[#0b0f19] border ${
                    unlocked ? "border-success/30 shadow-glow" : "border-darkBorder"
                  }`}>
                    {b.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${unlocked ? "text-white" : "text-slate-400"}`}>{b.title}</h4>
                      {unlocked ? (
                        <FiCheckCircle className="text-success" size={14} />
                      ) : (
                        <FiLock className="text-slate-500" size={12} />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{b.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
