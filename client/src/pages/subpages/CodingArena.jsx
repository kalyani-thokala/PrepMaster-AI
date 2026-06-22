import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import MonacoWrapper from "../../components/MonacoWrapper.jsx";
import toast from "react-hot-toast";
import { FiCode, FiPlay, FiTerminal, FiAward, FiInfo } from "react-icons/fi";

const CodingArena = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDescTab, setActiveDescTab] = useState("description");
  const challengesPerPage = 6;

  const fetchChallenges = async () => {
    try {
      const response = await apiClient.get("/coding-challenges");
      if (response.data.data && response.data.data.length > 0) {
        setChallenges(response.data.data);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      console.warn("Failed fetching coding challenges: ", err);
      setChallenges([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const selectChallenge = async (chall) => {
    try {
      const response = await apiClient.get(`/coding-challenges/${chall._id}`);
      const fullChallenge = response.data.data;
      setSelectedChallenge(fullChallenge);
      setResults(null);
      setActiveDescTab("description");
      
      // Set default starter code
      const starter = fullChallenge.starterCode?.find((c) => c.language === language) || fullChallenge.starterCode?.[0];
      setCode(starter ? starter.code : "");
      if (starter) setLanguage(starter.language);
    } catch (err) {
      toast.error("Failed to load challenge details");
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const starter = selectedChallenge?.starterCode?.find((c) => c.language === lang);
    if (starter) {
      setCode(starter.code);
    } else {
      setCode("");
    }
  };

  const runCode = async () => {
    if (!code) return toast.error("Please write code before compiling");

    setRunning(true);
    setResults(null);
    try {
      const response = await apiClient.post(`/coding-challenges/${selectedChallenge._id}/run`, {
        language,
        code
      });
      setResults(response.data.data);
      if (response.data.data.allPassed) {
        toast.success("Congratulations! All test cases passed!");
      } else {
        toast.error("Some test cases failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Compilation failed");
    } finally {
      setRunning(false);
    }
  };

  const indexOfLastChallenge = currentPage * challengesPerPage;
  const indexOfFirstChallenge = indexOfLastChallenge - challengesPerPage;
  const currentChallenges = challenges.slice(indexOfFirstChallenge, indexOfLastChallenge);
  const totalPages = Math.ceil(challenges.length / challengesPerPage);

  return (
    <div className="space-y-8">
      {/* 1. SELECTION LIST PANE */}
      {!selectedChallenge && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white Outfit">Coding Practice Challenges</h3>
          </div>

          {loadingList ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading arena...</div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm glass-panel border-slate-800">No challenges found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentChallenges.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => selectChallenge(c)}
                    className="glass-panel glass-panel-hover p-6 flex flex-col justify-between cursor-pointer border-slate-800 relative group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2.5 py-1 bg-[#0b0f19] border border-darkBorder text-slate-300 text-[10px] uppercase font-bold tracking-widest rounded-lg">
                          {c.topic}
                        </span>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${
                          c.difficulty === "Easy" ? "text-success" : c.difficulty === "Medium" ? "text-primary" : "text-danger"
                        }`}>
                          {c.difficulty}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white Outfit group-hover:text-primary transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        Solve challenge and verify edge cases across multiple languages.
                      </p>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-widest hover:underline">
                        Solve Challenge
                        <FiPlay size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1.5 bg-[#0b0f19] border border-darkBorder text-slate-400 hover:text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1.5 bg-[#0b0f19] border border-darkBorder text-slate-400 hover:text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 2. LEETCODE CODE RUNNER ARENA */}
      {selectedChallenge && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto animate-fade-in">
          
          {/* Back button and Meta */}
          <div className="col-span-12 flex justify-between items-center border-b border-darkBorder/60 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-xs text-slate-400 hover:text-white font-semibold underline"
              >
                Back to Arena
              </button>
              <h3 className="text-lg font-bold text-white Outfit">{selectedChallenge.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="glass-input text-xs py-1.5 px-3 bg-[#0b0f19]"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          {/* Left panel: Description vs Solution Tabs */}
          <div className="col-span-12 lg:col-span-5 glass-panel p-6 flex flex-col max-h-[600px] overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-darkBorder pb-2 mb-4 gap-4">
              <button
                onClick={() => setActiveDescTab("description")}
                className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${
                  activeDescTab === "description" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveDescTab("solution")}
                className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${
                  activeDescTab === "solution" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Solution & Explanation
              </button>
            </div>

            {/* Tab Contents */}
            <div className="overflow-y-auto flex-1 space-y-4 text-xs text-slate-300 leading-relaxed font-sans pr-1">
              {activeDescTab === "description" ? (
                <div className="whitespace-pre-line space-y-3">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-[#0b0f19] border border-darkBorder text-slate-300 text-[9px] uppercase font-bold tracking-wider rounded">
                      {selectedChallenge.topic}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      selectedChallenge.difficulty === "Easy" ? "bg-success/10 text-success" : selectedChallenge.difficulty === "Medium" ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                    }`}>
                      {selectedChallenge.difficulty}
                    </span>
                  </div>
                  {selectedChallenge.description}
                </div>
              ) : (
                <div className="space-y-4 whitespace-pre-line">
                  <div className="bg-[#0b0f19]/60 border border-darkBorder p-4 rounded-xl">
                    <h5 className="font-bold text-white mb-2 Outfit">Approach & Analysis</h5>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedChallenge.solution || "No solution explanation available yet."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Editor and Run */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <MonacoWrapper
              value={code}
              onChange={(val) => setCode(val)}
              language={language}
              height="400px"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Verify edge cases before submit</span>
              <button
                onClick={runCode}
                disabled={running}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiTerminal size={14} />
                {running ? "Running Tests..." : "Run Code"}
              </button>
            </div>

            {/* Results Console */}
            {results && (
              <div className="glass-panel p-5 space-y-4 bg-[#070b13] border-slate-800 animate-fade-in">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-darkBorder/40 pb-2 flex items-center gap-2">
                  <FiTerminal /> Test Case Verdict
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center py-2 bg-[#0b0f19] rounded-xl border border-darkBorder">
                  <div>
                    <span className="text-2xl font-bold text-white">{results.passedCases}/{results.totalCases}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-1">Tests Passed</p>
                  </div>
                  <div>
                    <span className={`text-2xl font-bold ${results.allPassed ? "text-success" : "text-danger"}`}>
                      {results.allPassed ? "ACCEPTED" : "FAILED"}
                    </span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-1">Verdict Status</p>
                  </div>
                </div>

                {/* Individual Case reviews */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {results.runResults.map((r, idx) => (
                    <div key={idx} className="bg-[#0b0f19]/80 border border-darkBorder p-3 rounded-lg flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-400">Test Case {idx + 1}</p>
                        <p className="text-[10px] text-slate-500">Input: {r.input}</p>
                        <p className="text-[10px] text-slate-500">Expected: {r.expectedOutput}</p>
                        <p className="text-[10px] text-slate-500">Actual: {r.actualOutput}</p>
                      </div>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${r.passed ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {r.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default CodingArena;
