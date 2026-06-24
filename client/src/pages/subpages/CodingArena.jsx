import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import MonacoWrapper from "../../components/MonacoWrapper.jsx";
import toast from "react-hot-toast";
import { FiCode, FiPlay, FiTerminal, FiAward, FiInfo, FiActivity } from "react-icons/fi";

const CodingArena = () => {
  const [topic, setTopic] = useState("Arrays");
  const [difficulty, setDifficulty] = useState("Medium");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null); // { score, rating, feedback, timeComplexity, spaceComplexity, improvements, allPassed, passedCases, totalCases, executionTime, memoryUsage }
  const [activeDescTab, setActiveDescTab] = useState("description");

  const generateChallenge = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setResults(null);
    try {
      const response = await apiClient.post("/coding/generate", { topic, difficulty });
      const challengeData = response.data.data;
      setSelectedChallenge(challengeData);
      
      // Set default starter code
      const starter = challengeData.starterCode?.find((c) => c.language === language) || challengeData.starterCode?.[0];
      setCode(starter ? starter.code : "");
      if (starter) setLanguage(starter.language);
      
      toast.success("AI Coding challenge generated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate challenge");
    } finally {
      setGenerating(false);
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

  const submitCode = async () => {
    if (!code) return toast.error("Please write code before submitting");

    setSubmitting(true);
    setResults(null);
    try {
      const response = await apiClient.post("/coding/submit", {
        codingTestId: selectedChallenge.codingTestId,
        code,
        language
      });
      setResults(response.data.data);
      setActiveDescTab("evaluation");
      
      if (response.data.data.allPassed) {
        toast.success("Accepted! All test cases passed!");
      } else {
        toast.error("Verdict: Failed test cases.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Evaluation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. SELECTION & SETUP PANE */}
      {!selectedChallenge && (
        <div className="max-w-xl mx-auto glass-panel p-6 sm:p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiCode size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-white Outfit">AI Coding Arena</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Choose your programming topic and difficulty tier. Gemini will generate a completely unique coding puzzle with hidden test cases.
          </p>

          <form onSubmit={generateChallenge} className="space-y-6 mt-8 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Algorithm/Data Structure Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full glass-input bg-[#0b0f19]"
              >
                <option value="Arrays">Arrays</option>
                <option value="Strings">Strings</option>
                <option value="Linked Lists">Linked Lists</option>
                <option value="Trees">Trees</option>
                <option value="Graphs">Graphs</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Recursion">Recursion</option>
                <option value="Sorting">Sorting</option>
                <option value="Searching">Searching</option>
                <option value="Greedy">Greedy Algorithms</option>
                <option value="Hashing">Hashing</option>
                <option value="Stack">Stack</option>
                <option value="Queue">Queue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Difficulty Tier</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full glass-input bg-[#0b0f19]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {generating ? "Generating Fresh Coding Challenge..." : "Start Coding Session"}
            </button>
          </form>
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
                Exit Arena
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
                <option value="c">C</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          {/* Left panel: Description vs AI Evaluation Tabs */}
          <div className="col-span-12 lg:col-span-5 glass-panel p-6 flex flex-col max-h-[650px] overflow-hidden">
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
              {results && (
                <button
                  onClick={() => setActiveDescTab("evaluation")}
                  className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${
                    activeDescTab === "evaluation" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  AI Evaluation
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="overflow-y-auto flex-1 space-y-4 text-xs text-slate-300 leading-relaxed font-sans pr-1">
              {activeDescTab === "description" ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <span className="px-2.5 py-0.5 bg-[#0b0f19] border border-darkBorder text-slate-300 text-[9px] uppercase font-bold tracking-wider rounded">
                      {selectedChallenge.topic}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      selectedChallenge.difficulty === "Easy" ? "bg-success/10 text-success" : selectedChallenge.difficulty === "Medium" ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                    }`}>
                      {selectedChallenge.difficulty}
                    </span>
                  </div>
                  
                  <div className="whitespace-pre-line font-sans font-medium text-slate-200">
                    {selectedChallenge.description}
                  </div>

                  <div className="border-t border-darkBorder/40 pt-3 space-y-2">
                    <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Input Format</h5>
                    <p className="text-slate-400">{selectedChallenge.inputFormat}</p>
                    
                    <h5 className="font-bold text-white uppercase tracking-wider text-[10px] mt-2">Output Format</h5>
                    <p className="text-slate-400">{selectedChallenge.outputFormat}</p>

                    <h5 className="font-bold text-white uppercase tracking-wider text-[10px] mt-2">Constraints</h5>
                    <p className="text-slate-400 font-mono">{selectedChallenge.constraints}</p>
                  </div>

                  {selectedChallenge.examples && selectedChallenge.examples.length > 0 && (
                    <div className="border-t border-darkBorder/40 pt-3 space-y-3">
                      <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Examples</h5>
                      {selectedChallenge.examples.map((ex, idx) => (
                        <div key={idx} className="bg-[#0b0f19]/60 p-3 rounded-lg border border-darkBorder/50 font-mono space-y-1">
                          <p className="text-slate-300 text-[10px]"><span className="text-slate-500">Input:</span> {ex.input}</p>
                          <p className="text-slate-300 text-[10px]"><span className="text-slate-500">Output:</span> {ex.output}</p>
                          {ex.explanation && <p className="text-slate-500 text-[9px] font-sans mt-1">Explanation: {ex.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 font-sans text-slate-300">
                  <div className="bg-[#0b0f19] border border-darkBorder p-4 rounded-xl text-center">
                    <span className="text-3xl font-extrabold text-primary block Outfit">{results.score}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 block">AI Grader Score</span>
                    <span className="text-[10px] font-semibold text-slate-500 block">Rating: {results.rating}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0b0f19]/40 border border-darkBorder/60 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Time Complexity</p>
                      <span className="text-xs font-mono font-bold text-white">{results.timeComplexity}</span>
                    </div>
                    <div className="bg-[#0b0f19]/40 border border-darkBorder/60 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Space Complexity</p>
                      <span className="text-xs font-mono font-bold text-white">{results.spaceComplexity}</span>
                    </div>
                  </div>

                  <div className="bg-[#0b0f19]/60 border border-darkBorder p-4 rounded-xl space-y-2">
                    <h5 className="font-bold text-white flex items-center gap-1"><FiInfo className="text-primary" /> AI Evaluation Feedback</h5>
                    <p className="leading-relaxed text-xs text-slate-300">{results.feedback}</p>
                  </div>

                  {results.improvements && results.improvements.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-white uppercase tracking-wider text-[10px] text-amber-500">Suggested Improvements</h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {results.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                onClick={submitCode}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiTerminal size={14} />
                {submitting ? "Compiling & Grading..." : "Submit Code"}
              </button>
            </div>

            {/* Results Console */}
            {results && (
              <div className="glass-panel p-5 space-y-4 bg-[#070b13] border-slate-800 animate-fade-in">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-darkBorder/40 pb-2 flex items-center gap-2">
                  <FiTerminal /> Test Case Verdict
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center py-2 bg-[#0b0f19] rounded-xl border border-darkBorder">
                  <div>
                    <span className="text-xl font-bold text-white">{results.passedCases}/{results.totalCases}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-1">Tests Passed</p>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">{results.executionTime}s</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-1">Time</p>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">{results.memoryUsage} KB</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-1">Memory</p>
                  </div>
                </div>

                {/* Individual Case reviews */}
                {results.executionResults && results.executionResults.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {results.executionResults.map((r, idx) => (
                      <div key={idx} className="bg-[#0b0f19]/80 border border-darkBorder p-3 rounded-lg flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-400">Test Case {idx + 1} {idx < selectedChallenge.testCases.length ? "(Sample)" : "(Hidden)"}</p>
                          <p className="text-[10px] text-slate-500">Input: {r.input || "Hidden Input"}</p>
                          <p className="text-[10px] text-slate-500">Expected: {r.expectedOutput || "Hidden Output"}</p>
                          <p className="text-[10px] text-slate-500">Actual: {r.actualOutput || "Hidden Output"}</p>
                        </div>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${r.passed ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                          {r.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default CodingArena;
