import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiCheckCircle, FiAlertTriangle, FiAward, FiClock, FiHelpCircle } from "react-icons/fi";

const AptitudePortal = () => {
  const [category, setCategory] = useState("Quantitative Aptitude");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [assessment, setAssessment] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ questionIndex, selectedOption }]
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer state (seconds)
  const [timeLeft, setTimeLeft] = useState(900); // default 15 minutes
  const [totalDuration, setTotalDuration] = useState(900);

  useEffect(() => {
    if (assessment && timeLeft > 0 && !report) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (assessment && timeLeft === 0 && !report) {
      submitAssessment();
    }
  }, [assessment, timeLeft, report]);

  const startTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const countNum = Number(questionCount);
      const response = await apiClient.post("/aptitude/generate", {
        topic: category,
        category,
        difficulty,
        questionCount: countNum
      });
      
      const testData = response.data.data;
      setAssessment(testData);
      setAnswers([]);
      setCurrentIdx(0);
      setReport(null);
      setTimeLeft(testData.duration || 900);
      setTotalDuration(testData.duration || 900);
      toast.success("Aptitude assessment loaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (opt) => {
    const updated = [...answers];
    const existingIdx = updated.findIndex((a) => a.questionIndex === currentIdx);
    
    if (existingIdx > -1) {
      updated[existingIdx].selectedOption = opt;
    } else {
      updated.push({ questionIndex: currentIdx, selectedOption: opt });
    }
    setAnswers(updated);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      const durationTaken = totalDuration - timeLeft;
      const response = await apiClient.post("/aptitude/submit", {
        aptitudeTestId: assessment.aptitudeTestId,
        answers: answers,
        durationTaken
      });
      setReport(response.data.data);
      setAssessment(null);
      toast.success("Test submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to grade test");
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedOption = () => {
    const ans = answers.find((a) => a.questionIndex === currentIdx);
    return ans ? ans.selectedOption : "";
  };

  return (
    <div className="space-y-8">
      
      {/* 1. SETUP PAGE */}
      {!assessment && !report && (
        <div className="max-w-xl mx-auto glass-panel p-6 sm:p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiHelpCircle size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-white Outfit">MCQ Assessments</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Choose your prep category and difficulty tier. Gemini will generate a custom MCQ placement exam.
          </p>

          <form onSubmit={startTest} className="space-y-6 mt-8 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Topic Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input bg-[#0b0f19]"
              >
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Logical Reasoning">Logical Reasoning</option>
                <option value="Verbal Ability">Verbal Ability</option>
                <option value="Data Interpretation">Data Interpretation</option>
                <option value="Probability">Probability</option>
                <option value="Permutations and Combinations">Permutations & Combinations</option>
                <option value="Time and Work">Time and Work</option>
                <option value="Time Speed Distance">Time Speed Distance</option>
                <option value="Profit and Loss">Profit and Loss</option>
                <option value="Percentages">Percentages</option>
                <option value="Ratios">Ratios</option>
                <option value="Number Systems">Number Systems</option>
                <option value="Simplification">Simplification</option>
                <option value="Blood Relations">Blood Relations</option>
                <option value="Coding Decoding">Coding Decoding</option>
                <option value="Seating Arrangements">Seating Arrangements</option>
                <option value="Puzzles">Puzzles</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Questions Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full glass-input bg-[#0b0f19]"
                >
                  <option value="10">10 Questions (15 Mins)</option>
                  <option value="15">15 Questions (20 Mins)</option>
                  <option value="20">20 Questions (30 Mins)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {loading ? "Generating Questions..." : "Begin Timed Assessment"}
            </button>
          </form>
        </div>
      )}

      {/* 2. TIMER PORTAL */}
      {assessment && !report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-4xl mx-auto animate-fade-in">
          
          {/* Side panel status */}
          <div className="col-span-12 lg:col-span-4 glass-panel p-5 h-fit flex flex-row lg:flex-col justify-between items-center lg:items-stretch gap-4">
            <div className="flex items-center gap-3">
              <FiClock size={20} className="text-slate-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Time Remaining</p>
                <span className={`text-xl font-bold font-mono ${timeLeft < 60 ? "text-danger animate-pulse" : "text-text"}`}>
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            <div className="hidden lg:block border-t border-darkBorder my-4" />

            <div className="flex flex-wrap lg:grid lg:grid-cols-5 gap-2 justify-center">
              {assessment.questions.map((q, idx) => {
                const isAnswered = answers.some((a) => a.questionIndex === idx);
                const isCurrent = currentIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center border transition-all ${
                      isCurrent
                        ? "bg-primary/20 border-primary text-primary"
                        : isAnswered
                        ? "bg-secondary/15 border-secondary/30 text-secondary"
                        : "bg-[#0b0f19] border-darkBorder text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={submitAssessment}
              disabled={submitting}
              className="px-6 py-3 lg:w-full bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>

          {/* MCQ question pane */}
          <div className="col-span-12 lg:col-span-8 glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest border-b border-darkBorder pb-4">
              <span>Question {currentIdx + 1} of {assessment.questions.length}</span>
              <span>{assessment.questions[currentIdx].topic}</span>
            </div>

            <h3 className="text-base font-bold text-white leading-relaxed">
              {assessment.questions[currentIdx].question}
            </h3>

            {/* Options list */}
            <div className="space-y-3">
              {assessment.questions[currentIdx].options.map((opt, idx) => {
                const isSelected = getSelectedOption() === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 rounded-xl border text-xs font-semibold leading-relaxed transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-glow"
                        : "bg-[#0b0f19]/60 border-darkBorder text-slate-300 hover:bg-slate-800/30"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${
                      isSelected ? "bg-primary text-white border-primary" : "bg-[#0b0f19] border-darkBorder text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-darkBorder/60">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                Previous Question
              </button>
              <button
                disabled={currentIdx === assessment.questions.length - 1}
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-4 py-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50 transition-colors"
              >
                Next Question
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 3. SUBMISSION REPORT CARD */}
      {report && (
        <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-10 space-y-8 animate-fade-in">
          <div className="text-center border-b border-darkBorder pb-6">
            <h3 className="text-2xl font-extrabold text-white Outfit">Assessment Report Card</h3>
            
            <div className="mt-6 inline-block bg-[#0b0f19] border border-darkBorder px-8 py-4 rounded-xl">
              <span className="text-4xl font-extrabold text-primary Outfit">{report.score}%</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Score</p>
            </div>
            
            <div className="mt-2 text-slate-400 text-xs font-semibold">
              Accuracy: <span className="text-white">{report.accuracy}%</span>
            </div>
          </div>

          {/* SWOT counters */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#0b0f19] border border-darkBorder p-4 rounded-xl">
              <span className="text-xl font-bold text-success">{report.correctAnswers}</span>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Correct</p>
            </div>
            <div className="bg-[#0b0f19] border border-darkBorder p-4 rounded-xl">
              <span className="text-xl font-bold text-danger">{report.wrongAnswers}</span>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Wrong</p>
            </div>
            <div className="bg-[#0b0f19] border border-darkBorder p-4 rounded-xl">
              <span className="text-xl font-bold text-slate-400">{report.skippedAnswers}</span>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Skipped</p>
            </div>
          </div>

          {/* TOPIC BREAKDOWNS */}
          {report.topicBreakdown && report.topicBreakdown.length > 0 && (
            <div className="bg-[#0b0f19]/30 p-5 border border-darkBorder rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FiAward className="text-primary" /> Topic Performance Breakdown
              </h4>
              {report.topicBreakdown.map((t, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-darkBorder/30 pb-2 last:border-b-0">
                  <span className="text-slate-300">{t.topic}</span>
                  <span className="font-semibold text-primary">{t.correct}/{t.total} Correct</span>
                </div>
              ))}
            </div>
          )}

          {/* WEAK AREAS & AI RECOMMENDATIONS */}
          {report.weakAreas && report.weakAreas.length > 0 && (
            <div className="bg-[#0b0f19]/60 border border-darkBorder p-5 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs text-amber-500">Weak Areas Identified</h4>
              <p className="text-slate-300 leading-relaxed font-sans">
                You struggled in: <span className="font-bold text-white">{report.weakAreas.join(", ")}</span>
              </p>
              {report.improvementSuggestions && report.improvementSuggestions.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-primary uppercase tracking-widest text-[9px] mb-1">Recommended Action Steps</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    {report.improvementSuggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* EXPLANATIONS */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-darkBorder/40 pb-2">Solutions & Explanations</h4>
            {report.questions.map((q, idx) => {
              const userAns = report.answers.find((a) => a.questionIndex === idx);
              const isCorrect = userAns?.isCorrect;
              const hasAnswered = userAns?.selectedOption !== "";
              return (
                <div key={idx} className="bg-[#0b0f19]/40 border border-darkBorder p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-darkBorder/40 pb-2 text-[11px] font-semibold">
                    <span className="text-slate-400">Question {idx + 1} ({q.topic})</span>
                    <span className={isCorrect ? "text-success" : hasAnswered ? "text-danger" : "text-slate-500"}>
                      {isCorrect ? "Correct" : hasAnswered ? "Wrong" : "Skipped"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">Q: {q.question}</p>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Correct Option: <span className="text-success font-semibold">{q.correctAnswer}</span>
                  </p>
                  {userAns?.selectedOption && !isCorrect && (
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Your Option: <span className="text-danger font-semibold">{userAns.selectedOption}</span>
                    </p>
                  )}
                  <div className="bg-[#0b0f19] p-3 rounded-lg border border-darkBorder/40 text-[10px] text-slate-300 leading-relaxed">
                    <p className="font-semibold text-primary mb-0.5 uppercase tracking-widest text-[9px]">Explanation</p>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => { setReport(null); setAssessment(null); }}
            className="w-full py-3.5 bg-card border border-darkBorder text-slate-300 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            Practice New Assessment
          </button>
        </div>
      )}

    </div>
  );
};

export default AptitudePortal;
