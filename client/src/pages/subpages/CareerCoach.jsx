import React, { useState, useRef, useEffect } from "react";
import apiClient from "../../services/api.js";
import { FiSend, FiMessageSquare } from "react-icons/fi";

const CareerCoach = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: "Hello! I am your PrepMaster AI Career Coach. Ask me anything about coding interviews, resume reviews, placement strategies at companies like TCS or Amazon, or subject preparation paths."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  
  const chatBottomRef = useRef(null);

  const autoScroll = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    autoScroll();
  }, [messages, sending]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", parts: userMsg }]);
    setSending(true);

    try {
      // Map history format: [{ role: 'user'|'model', parts: string }]
      const response = await apiClient.post("/chat/send", {
        message: userMsg,
        chatHistory: messages
      });

      const reply = response.data.data.response;
      setMessages((prev) => [...prev, { role: "model", parts: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: "I apologize, but I encountered an issue. Let's try that request again." }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestClick = (suggestText) => {
    setInputValue(suggestText);
  };

  const suggestions = [
    "What is the recruitment pattern for TCS NQT?",
    "Explain the key principles of Object-Oriented Programming.",
    "Give me tips on how to prepare for Amazon SDE-1 interviews.",
    "What core projects should I list on my resume?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto h-[calc(100vh-140px)] animate-fade-in">
      
      {/* Suggestions and tips panel */}
      <div className="col-span-12 lg:col-span-4 glass-panel p-5 h-fit hidden lg:flex flex-col space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-darkBorder pb-2">
          <FiMessageSquare /> Topic suggestions
        </h4>
        <div className="flex flex-col gap-2.5">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestClick(s)}
              className="text-left text-xs text-slate-400 hover:text-primary p-3 rounded-lg bg-[#0b0f19]/30 border border-darkBorder hover:border-primary/20 transition-all font-semibold leading-relaxed"
            >
              "{s}"
            </button>
          ))}
        </div>
      </div>

      {/* Main chat window container */}
      <div className="col-span-12 lg:col-span-8 glass-panel flex flex-col h-full overflow-hidden">
        
        {/* Chat header */}
        <div className="bg-[#0b0f19]/50 border-b border-darkBorder px-5 py-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-text">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
            PrepMaster Career Mentor
          </span>
          <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
            Gemini Core
          </span>
        </div>

        {/* Messages threads */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px]">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow ${
                  isUser ? "bg-secondary text-white" : "bg-primary text-white"
                }`}>
                  {isUser ? "U" : "P"}
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? "bg-secondary/15 border border-secondary/35 text-slate-200 rounded-tr-none"
                    : "bg-[#0b0f19]/80 border border-darkBorder text-slate-300 rounded-tl-none whitespace-pre-wrap"
                }`}>
                  {m.parts}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">P</div>
              <div className="flex gap-1 bg-[#0b0f19] px-4 py-3 rounded-2xl border border-darkBorder rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="bg-[#0b0f19]/60 border-t border-darkBorder p-4 flex gap-3">
          <input
            type="text"
            className="flex-1 glass-input focus:ring-0 focus:ring-offset-0 py-3 text-xs"
            placeholder="Ask AI Career Coach..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={sending || !inputValue.trim()}
            className="px-5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            <FiSend size={15} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default CareerCoach;
