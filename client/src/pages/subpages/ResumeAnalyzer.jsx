import React, { useState, useEffect } from "react";
import apiClient from "../../services/api.js";
import toast from "react-hot-toast";
import { FiUploadCloud, FiAward, FiAlertTriangle, FiList, FiCheckCircle } from "react-icons/fi";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await apiClient.get("/resumes/history");
      setHistory(response.data.data);
    } catch (err) {
      console.error("Failed to load resume history: ", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file to scan");

    const formData = new FormData();
    formData.append("resume", file);

    setAnalyzing(true);
    try {
      const response = await apiClient.post("/resumes/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(response.data.data);
      toast.success("Resume analyzed successfully!");
      fetchHistory(); // Refresh history logs
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to parse resume file");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FILE UPLOADER CONTAINER */}
        <div className="glass-panel p-6 lg:col-span-1 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 Outfit">Upload Resume</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Upload your CV in PDF or DOCX format. Our AI will analyze the content against standard job descriptors and score the ATS match.
          </p>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-darkBorder hover:border-primary/50 transition-all rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer bg-[#0b0f19]/30 relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
              <FiUploadCloud size={40} className="text-slate-400 mb-3" />
              <span className="text-sm font-semibold text-text">
                {file ? file.name : "Select PDF / DOCX file"}
              </span>
              <span className="text-xs text-slate-500 mt-1">Max file size: 5MB</span>
            </div>

            <button
              type="submit"
              disabled={analyzing || !file}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {analyzing ? "Analyzing Resume..." : "Scan & Analyze"}
            </button>
          </form>
        </div>

        {/* RESULTS FEEDBACK BLOCK */}
        <div className="glass-panel p-6 lg:col-span-2 min-h-[400px] flex flex-col">
          {result ? (
            <div className="space-y-8 animate-fade-in flex-1">
              
              {/* SCORE BOXES */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b0f19] border border-darkBorder p-5 rounded-xl text-center">
                  <span className="text-3xl font-extrabold text-primary Outfit">{result.resumeScore}%</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">Overall Rating</p>
                </div>
                <div className="bg-[#0b0f19] border border-darkBorder p-5 rounded-xl text-center">
                  <span className="text-3xl font-extrabold text-secondary Outfit">{result.atsScore}%</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">ATS Scan Match</p>
                </div>
              </div>

              {/* DETAILS TABS */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiCheckCircle className="text-success" />
                    Key Strengths
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {result.strengths.map((str, idx) => (
                      <li key={idx} className="bg-success/5 border border-success/15 px-3 py-2 rounded-lg">• {str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiAlertTriangle className="text-rose-400" />
                    Weaknesses & Gaps
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {result.weaknesses.map((weak, idx) => (
                      <li key={idx} className="bg-rose-500/5 border border-rose-500/15 px-3 py-2 rounded-lg">• {weak}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiList className="text-primary" />
                    Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1.5 bg-[#0b0f19] border border-darkBorder text-slate-300 text-xs rounded-lg font-semibold">{sk}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiAward className="text-amber-500" />
                    Action Recommendations
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.recommendations.map((sug, idx) => (
                      <li key={idx} className="bg-amber-500/5 border border-amber-500/15 px-3 py-2 rounded-lg">• {sug}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-8">
              <FiUploadCloud size={48} className="mb-4 text-slate-600" />
              <h4 className="text-sm font-semibold text-slate-400">No active scan review displayed</h4>
              <p className="text-xs max-w-sm mt-1">Upload and submit your CV above to get instant SWOT scores and feedback lists.</p>
            </div>
          )}
        </div>
      </div>

      {/* SCAN HISTORY LISTS */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-6 Outfit">Resume Scan History</h3>
        {loadingHistory ? (
          <div className="text-center py-6 text-slate-400 text-xs">Loading logs...</div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-darkBorder uppercase font-bold tracking-wider">
                  <th className="pb-3">Filename</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">ATS Match</th>
                  <th className="pb-3">Date scanned</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/60">
                {history.map((h) => (
                  <tr key={h._id} className="text-slate-300 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4.5 font-medium">{h.fileName}</td>
                    <td className="py-4.5">{h.resumeScore}%</td>
                    <td className="py-4.5">{h.atsScore}%</td>
                    <td className="py-4.5">{new Date(h.createdAt).toLocaleDateString()}</td>
                    <td className="py-4.5 text-right">
                      <button
                        onClick={() => setResult(h)}
                        className="text-primary hover:underline font-semibold"
                      >
                        Inspect Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">No resumes uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
