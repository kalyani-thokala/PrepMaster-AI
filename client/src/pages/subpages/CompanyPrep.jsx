import React, { useState } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiTarget, FiHelpCircle, FiCpu, FiUserCheck, FiBookOpen } from "react-icons/fi";

const CompanyPrep = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(false);

  const COMPANIES = [
    { name: "Google", logo: "🔴", desc: "Top-tier product algorithmic interviews." },
    { name: "Amazon", logo: "🟡", desc: "Heavy focus on leadership principles & data structures." },
    { name: "Microsoft", logo: "🔵", desc: "Systems, algorithms, and design interviews." },
    { name: "TCS", logo: "💎", desc: "Aptitude, Core CS subjects, & Coding." },
    { name: "Infosys", logo: "🌍", desc: "Service hiring & technical foundations." },
    { name: "Wipro", logo: "🟢", desc: "CS conceptual fundamentals & basic coding." },
    { name: "Accenture", logo: "🟣", desc: "Technical aptitude, logical & HR interviews." },
    { name: "Cognizant", logo: "🟠", desc: "Coding, DBMS, & basic architecture." },
    { name: "Capgemini", logo: "🔷", desc: "Behavioral fit & OOP concepts." },
    { name: "Deloitte", logo: "☘️", desc: "Case study, logic, and consultancy fit." }
  ];

  const handleSelectCompany = async (companyName) => {
    setSelectedCompany(companyName);
    setLoading(true);
    setPrepData(null);
    try {
      const response = await apiClient.get(`/company/${companyName}`);
      setPrepData(response.data.data);
    } catch (err) {
      toast.error("Failed to load company prep metrics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-primary/10 via-[#0b0f19]/30 to-card/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white Outfit">
            Company-Specific Preparation
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Prepare for specific placement drives. Select a company to view their hiring pipelines, online assessment metrics, and typical coding and HR questions.
          </p>
        </div>
      </div>

      {/* 1. SELECTION GRID */}
      {!selectedCompany && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPANIES.map((c) => (
            <div
              key={c.name}
              onClick={() => handleSelectCompany(c.name)}
              className="glass-panel glass-panel-hover p-6 flex flex-col justify-between cursor-pointer border-slate-800 group"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0b0f19] border border-darkBorder flex items-center justify-center text-xl">
                    {c.logo}
                  </div>
                  <h4 className="text-base font-bold text-white Outfit group-hover:text-primary transition-colors">
                    {c.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{c.desc}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                  View Syllabus & OA <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. RECRUITMENT DETAILED REVIEW */}
      {selectedCompany && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Back Action Header */}
          <div className="flex items-center justify-between border-b border-darkBorder/60 pb-4">
            <button
              onClick={() => { setSelectedCompany(null); setPrepData(null); }}
              className="text-xs text-slate-400 hover:text-white font-semibold underline"
            >
              Back to Catalog
            </button>
            <h3 className="text-lg font-bold text-white Outfit">{selectedCompany} Placement Blueprints</h3>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Consulting placement catalogs...</div>
          ) : prepData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: PIPELINE PROCESS & OA PATTERNS */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Process stages */}
                <div className="glass-panel p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-darkBorder pb-2">
                    <FiTarget className="text-primary" /> Recruitment Pipeline
                  </h4>
                  <div className="space-y-3 pl-3 border-l border-darkBorder relative ml-1.5">
                    {prepData.hiringProcess.map((step, idx) => (
                      <div key={idx} className="relative text-xs leading-relaxed">
                        <div className="absolute left-[-17px] top-1 w-2 h-2 rounded-full bg-primary" />
                        <span className="font-semibold text-white block">Round {idx + 1}</span>
                        <span className="text-slate-400 font-sans mt-0.5 block">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OA summaries */}
                <div className="glass-panel p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-darkBorder pb-2">
                    <FiBookOpen className="text-secondary" /> Online Assessment (OA)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                    {prepData.oaPattern}
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: SAMPLE QUESTIONS GRILL */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Algorithmic Coding */}
                <div className="glass-panel p-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-darkBorder pb-2">
                    <FiCpu className="text-rose-400" /> Typical Coding Challenges
                  </h4>
                  <div className="space-y-4">
                    {prepData.codingQuestions.map((q, idx) => (
                      <div key={idx} className="bg-[#0b0f19]/80 border border-darkBorder p-4 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-white">{q.title}</h5>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${
                            q.difficulty === "Easy" ? "text-success" : q.difficulty === "Medium" ? "text-primary" : "text-danger"
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{q.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subjects & HR critiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Technical concept questions */}
                  <div className="glass-panel p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-darkBorder pb-2">
                      <FiHelpCircle className="text-amber-500" /> Core Tech Questions
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                      {prepData.technicalQuestions.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">{q}</li>
                      ))}
                    </ul>
                  </div>

                  {/* HR questions */}
                  <div className="glass-panel p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-darkBorder pb-2">
                      <FiUserCheck className="text-emerald-500" /> Behavioral Fit (HR)
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                      {prepData.hrQuestions.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">Could not fetch company preparation data.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyPrep;
