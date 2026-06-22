import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiMapPin, FiPlay, FiBook, FiCode, FiAward } from "react-icons/fi";

const RoadmapVisualizer = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [currentSkills, setCurrentSkills] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchRoadmap = async () => {
    try {
      const response = await apiClient.get("/roadmaps");
      setRoadmap(response.data.data);
    } catch (err) {
      console.error("Failed fetching roadmap: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole) return toast.error("Please enter a target role");

    setGenerating(true);
    const skillsArray = currentSkills
      ? currentSkills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    try {
      const response = await apiClient.post("/roadmaps/generate", {
        targetRole,
        currentSkills: skillsArray
      });
      setRoadmap(response.data.data);
      toast.success("Learning roadmap generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      const response = await apiClient.put("/roadmaps/milestone", {
        milestoneId,
        status: newStatus
      });
      setRoadmap(response.data.data);
      toast.success("Milestone status updated!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading roadmap curriculum...</div>
      ) : !roadmap ? (
        
        /* 1. ROADMAP GENERATION FORM */
        <div className="max-w-xl mx-auto glass-panel p-6 sm:p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiMapPin size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-white Outfit">Curriculum Roadmap Generator</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Outline your target role and current skills. Gemini will construct a week-by-week stage plan with projects and learning links.
          </p>

          <form onSubmit={handleGenerate} className="space-y-6 mt-8 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Job Role</label>
              <input
                type="text"
                className="w-full glass-input"
                placeholder="e.g. Full Stack Developer, Data Analyst"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Current Skills (comma separated)</label>
              <input
                type="text"
                className="w-full glass-input"
                placeholder="e.g. JavaScript, HTML, React"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {generating ? "Building Curriculum..." : "Generate Learning Roadmap"}
            </button>
          </form>
        </div>
      ) : (
        
        /* 2. ROADMAP VISUAL TIMELINE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in">
          
          {/* Left panel metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-5 space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Target Path</span>
                <h4 className="text-lg font-bold text-white Outfit mt-0.5">{roadmap.targetRole}</h4>
                <p className="text-[11px] text-primary font-bold mt-1 uppercase tracking-widest">Duration: {roadmap.timeline}</p>
              </div>

              <div className="border-t border-darkBorder/60 my-4" />

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Skill Gaps Checklist</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {roadmap.missingSkills.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1.5 bg-[#0b0f19] border border-darkBorder text-slate-300 text-[10px] rounded-lg font-semibold">{sk}</span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setRoadmap(null)}
              className="w-full py-3 bg-card border border-darkBorder hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Re-generate Roadmap
            </button>
          </div>

          {/* Right panel Milestones timeline */}
          <div className="lg:col-span-2 space-y-6 relative pl-6 border-l-2 border-darkBorder/60 ml-3">
            {roadmap.milestones.map((mil, idx) => (
              <div key={mil._id} className="relative glass-panel p-6 mb-6">
                
                {/* Timeline node circle */}
                <div className="absolute left-[-35px] top-6 w-[18px] h-[18px] rounded-full border-4 border-background bg-primary shadow-md" />
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkBorder/40 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{mil.duration}</span>
                    <h4 className="text-base font-bold text-white Outfit mt-0.5">{mil.title}</h4>
                  </div>
                  <select
                    value={mil.status}
                    onChange={(e) => handleStatusChange(mil._id, e.target.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border bg-[#0b0f19] font-bold focus:outline-none focus:ring-0 ${
                      mil.status === "Completed"
                        ? "text-success border-success/30 bg-success/5"
                        : mil.status === "In Progress"
                        ? "text-primary border-primary/30 bg-primary/5"
                        : "text-slate-400 border-darkBorder"
                    }`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">{mil.description}</p>

                {/* Sub details */}
                <div className="space-y-4">
                  {/* Resources */}
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <FiBook /> Study Resources
                    </h5>
                    <div className="flex flex-col gap-1.5">
                      {mil.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1.5 leading-relaxed"
                        >
                          • {res.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <FiCode /> Practical Sandbox Projects
                    </h5>
                    {mil.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="bg-[#0b0f19]/80 border border-darkBorder p-3 rounded-lg text-xs leading-relaxed mb-1.5">
                        <p className="font-bold text-slate-200">{proj.title}</p>
                        <p className="text-slate-400 mt-1">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

export default RoadmapVisualizer;
