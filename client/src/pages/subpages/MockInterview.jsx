import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiPlay, FiCornerDownRight, FiCheckCircle, FiChevronRight, FiUser } from "react-icons/fi";

const MockInterview = () => {
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const startInterview = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post("/interviews/generate", { role, difficulty });
      setSession(response.data.data);
      setCurrentIdx(0);
      setAnswerText("");
      setReport(null);
      toast.success("Interview session generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) return toast.error("Please enter a response first");

    setSubmittingAnswer(true);
    const question = session.questions[currentIdx];

    try {
      const response = await apiClient.post("/interviews/submit-answer", {
        interviewId: session._id,
        questionId: question.questionId,
        answerText: answerText
      });

      // Update local session answer records
      const updatedAnswers = [...session.answers];
      const answerObject = response.data.data;
      const existing = updatedAnswers.findIndex((a) => a.questionId === question.questionId);

      if (existing > -1) {
        updatedAnswers[existing] = answerObject;
      } else {
        updatedAnswers.push(answerObject);
      }

      setSession({ ...session, answers: updatedAnswers });
      toast.success("Answer submitted and graded!");

      // Go to next question or show finalize
      if (currentIdx < session.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setAnswerText("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to grade answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const finalizeInterview = async () => {
    setFinalizing(true);
    try {
      const response = await apiClient.post("/interviews/finalize", {
        interviewId: session._id,
        duration: 300 // simulated 5 minutes duration
      });
      setReport(response.data.data);
      setSession(null);
      toast.success("Interview finalized! Overall scorecard ready.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to finalize session");
    } finally {
      setFinalizing(false);
    }
  };

  const resetPortal = () => {
    setSession(null);
    setReport(null);
    setAnswerText("");
  };

  return (
    <div className="space-y-8">
      {/* 1. SETUP PAGE */}
      {!session && !report && (
        <div className="max-w-xl mx-auto glass-panel p-6 sm:p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiPlay size={28} className="ml-1" />
          </div>
          <h2 className="text-2xl font-extrabold text-white Outfit">Mock Interview Generator</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Choose your target placement role and difficulty level. Gemini will generate a custom technical and behavioral exam.
          </p>

          <form onSubmit={startInterview} className="space-y-6 mt-8 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Job Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full glass-input bg-[#0b0f19]"
              >
                <option value="Software Engineer">Software Engineer (General)</option>
                <option value="Frontend Engineer">Frontend Engineer (React/Web)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Difficulty Tier</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full glass-input bg-[#0b0f19]"
              >
                <option value="Easy">Easy (Foundation concepts)</option>
                <option value="Medium">Medium (Standard campus level)</option>
                <option value="Hard">Hard (FAANG & Product system design)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {loading ? "Generating Session..." : "Begin Mock Interview"}
            </button>
          </form>
        </div>
      )}

      {/* 2. ACTIVE CONVERSATIONAL PORTAL */}
      {session && !report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in">
          
          {/* Side navigation checklist */}
          <div className="glass-panel p-5 lg:col-span-1 h-fit">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-darkBorder/60 pb-3">Session Progress</h4>
            <div className="space-y-2">
              {session.questions.map((q, idx) => {
                const isCompleted = session.answers.some((a) => a.questionId === q.questionId);
                const isCurrent = currentIdx === idx;
                return (
                  <button
                    key={q.questionId}
                    disabled={!isCompleted && !isCurrent}
                    onClick={() => {
                      setCurrentIdx(idx);
                      // Pull answers text if previously submitted
                      const prevAns = session.answers.find((a) => a.questionId === q.questionId);
                      setAnswerText(prevAns ? prevAns.answerText : "");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                      isCurrent
                        ? "bg-primary/10 border-l-4 border-primary text-primary"
                        : isCompleted
                        ? "text-success bg-success/5 hover:bg-success/10"
                        : "text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <span>Question {idx + 1} ({q.category})</span>
                    {isCompleted && <FiCheckCircle size={14} />}
                  </button>
                );
              })}
            </div>

            {/* Finalize button */}
            <button
              onClick={finalizeInterview}
              disabled={session.answers.length === 0 || finalizing}
              className="w-full mt-6 py-3 border border-secondary text-secondary hover:bg-secondary/10 font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {finalizing ? "Wrapping Session..." : "Finalize Scorecard"}
            </button>
          </div>

          {/* Active Question pane */}
          <div className="glass-panel p-6 lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest border-b border-darkBorder pb-4">
              <span>Question {currentIdx + 1} of {session.questions.length}</span>
              <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md font-bold">
                {session.questions[currentIdx].category}
              </span>
            </div>

            <div className="bg-[#0b0f19]/60 p-5 border border-darkBorder rounded-xl">
              <h3 className="text-base font-bold text-white leading-relaxed font-sans">
                {session.questions[currentIdx].text}
              </h3>
            </div>

            {/* Answer editor */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Your Response Transcript</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full h-44 glass-input bg-[#0b0f19]/80 resize-none leading-relaxed text-sm"
                placeholder="Write your explanation here. Be structured, try to use STAR method (Situation, Task, Action, Result) if behavioral, or explain runtime complexity (Big O) if technical..."
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={submitAnswer}
                  disabled={submittingAnswer || !answerText.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {submittingAnswer ? "Evaluating answer..." : "Submit Answer"}
                </button>
              </div>
            </div>

            {/* Immediate grading feedback if available */}
            {(() => {
              const currentQuestionId = session.questions[currentIdx].questionId;
              const gradedAnswer = session.answers.find((a) => a.questionId === currentQuestionId);
              if (gradedAnswer) {
                return (
                  <div className="bg-[#0b0f19]/80 border border-darkBorder/60 p-5 rounded-xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-darkBorder/40 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">AI Answer Appraisal</span>
                      <span className="text-sm font-extrabold text-primary">Score: {gradedAnswer.evaluation.score}%</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {gradedAnswer.evaluation.feedbackText}
                    </p>
                  </div>
                );
              }
              return null;
            })()}

          </div>
        </div>
      )}

      {/* 3. REPORT CARD PANEL */}
      {report && (
        <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-10 space-y-8 animate-fade-in">
          <div className="text-center border-b border-darkBorder pb-6">
            <h3 className="text-2xl font-extrabold text-white Outfit">Mock Interview Scorecard</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{report.role} • {report.difficulty} tier</p>
            
            {/* BIG SCORE OVERVIEW */}
            <div className="mt-6 inline-block bg-[#0b0f19] border border-darkBorder px-8 py-4 rounded-xl">
              <span className="text-4xl font-extrabold text-primary Outfit">{report.score}%</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Overall Rating</p>
            </div>
          </div>

          {/* SWOT ANALYTICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0b0f19]/30 p-5 border border-darkBorder rounded-xl">
              <h4 className="text-xs font-bold text-success uppercase tracking-widest mb-3 flex items-center gap-2">
                <FiCheckCircle /> Overall Strengths
              </h4>
              <ul className="text-xs text-slate-300 space-y-2">
                {report.feedback.strengths.map((str, idx) => (
                  <li key={idx}>• {str}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0b0f19]/30 p-5 border border-darkBorder rounded-xl">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FiCornerDownRight /> Core Weaknesses
              </h4>
              <ul className="text-xs text-slate-300 space-y-2">
                {report.feedback.weaknesses.map((weak, idx) => (
                  <li key={idx}>• {weak}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className="bg-[#0b0f19]/60 p-5 border border-darkBorder rounded-xl">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">AI Coach Action Suggestions</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              {report.feedback.recommendations.map((rec, idx) => (
                <li key={idx} className="bg-[#0b0f19] px-3 py-2 rounded-lg border border-darkBorder/60">• {rec}</li>
              ))}
            </ul>
          </div>

          {/* DETAILED QUESTION BREAKDOWNS */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-darkBorder/40 pb-2">Evaluated Transcript Details</h4>
            {report.answers.map((ans, idx) => (
              <div key={idx} className="bg-[#0b0f19]/40 border border-darkBorder p-5 rounded-xl space-y-3.5">
                <div className="flex justify-between items-center border-b border-darkBorder/60 pb-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Question {idx + 1}</span>
                  <span className="text-xs font-extrabold text-primary">Score: {ans.evaluation.score}%</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white italic">Q: {ans.questionText}</p>
                  <p className="text-xs text-slate-400 mt-2 pl-4 border-l-2 border-slate-700 leading-relaxed font-sans">
                    User Answer: "{ans.answerText}"
                  </p>
                </div>
                <div className="bg-[#0b0f19] p-3 rounded-lg border border-darkBorder/40 text-[11px] text-slate-300 leading-relaxed">
                  <p className="font-semibold text-primary mb-1 uppercase tracking-widest text-[9px]">Coach Critique</p>
                  {ans.evaluation.feedbackText}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={resetPortal}
            className="w-full py-3.5 bg-card border border-darkBorder text-slate-300 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            Practice New Mock Interview
          </button>
        </div>
      )}

    </div>
  );
};

export default MockInterview;
