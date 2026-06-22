import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiActivity,
  FiCode,
  FiMic,
  FiList,
  FiMessageCircle,
  FiMap,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.js";

const LandingPage = () => {
  const { user, authLoading } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const features = [
    {
      title: "Resume Optimizer",
      desc: "ATS scanner reviews structure, highlights missing skills, and formats details.",
      icon: FiFileText,
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Mock Interview Arena",
      desc: "AI-driven mock simulations with speech-to-text response evaluations.",
      icon: FiMic,
      color: "from-violet-500 to-purple-500"
    },
    {
      title: "LeetCode Practice",
      desc: "Syntax-highlighted Monaco editor with secure sandbox runtime outputs.",
      icon: FiCode,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Aptitude Prep",
      desc: "Timed quantitative reasoning, logical bloodlines, and verbal comprehensions.",
      icon: FiList,
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "AI Career Coach",
      desc: "Pragmatic placement strategies, learning paths, and roadmap tips.",
      icon: FiMessageCircle,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Roadmap Generator",
      desc: "Personalized week-by-week curriculum plans with links to resources.",
      icon: FiMap,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const statistics = [
    { value: "100K+", label: "Registered Candidates" },
    { value: "92%", label: "Placement Success Index" },
    { value: "500K+", label: "Practice Tests Completed" },
    { value: "15M+", label: "Lines of Code Compiled" }
  ];

  const testimonials = [
    {
      quote: "PrepMaster AI played a pivotal role in my interview preparation. The mock interview engine and real-time Gemini feedback refined my technical explanations. I cleared the Amazon recruitment drive easily!",
      author: "Aditi Sharma",
      role: "Software Dev at Amazon",
      initial: "A"
    },
    {
      quote: "The ATS resume scanning suggestions were a game changer. Adding the missing skills raised my scores and started landing me screening invitations from companies like Google and Deloitte within days.",
      author: "Rahul Verma",
      role: "Graduate Placement at Google",
      initial: "R"
    },
    {
      quote: "Practising aptitude MCQs on the platform gave me the speed and accuracy I needed to clear the TCS National Qualifier Test. I highly recommend this platform for anyone seeking placement prep.",
      author: "Sneha Patel",
      role: "System Engineer at TCS",
      initial: "S"
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* BACKGROUND GRAPHIC ORBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-darkBorder/40">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-white font-bold text-lg">
            P
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wider Outfit">
            PrepMaster AI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {!authLoading && user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:brightness-110 rounded-xl shadow-glow transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:brightness-110 rounded-xl shadow-glow transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-wider uppercase inline-block mb-6">
            ✨ Premium AI-Powered placement ecosystem
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight Outfit max-w-4xl mx-auto leading-none">
            Master Placements with <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Intelligence</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed font-light">
            Practice mock interviews, code challenges, verbal aptitude tests, and ATS resume optimizations on one intelligent unified dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!authLoading && user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-glow hover:brightness-110 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-glow hover:brightness-110 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02]"
              >
                Start Preparing Free
              </Link>
            )}
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-300 hover:text-white bg-card border border-darkBorder hover:bg-slate-800 rounded-xl transition-all duration-300"
            >
              Explore Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-darkBorder/40">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white Outfit">Everything You Need To Get Hired</h3>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            A comprehensive suite of modules designed to elevate your assessment scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel glass-panel-hover p-8 relative overflow-hidden group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center mb-6 shadow-md`}>
                  <Icon size={22} />
                </div>
                <h4 className="text-lg font-bold text-white Outfit">{feat.title}</h4>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">{feat.desc}</p>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-[#0b0f19]/80 border-y border-darkBorder/40 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {statistics.map((stat, idx) => (
            <div key={idx}>
              <span className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent Outfit">
                {stat.value}
              </span>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold uppercase tracking-wider mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white Outfit">Success Stories</h3>
          <p className="text-slate-400 mt-2">Hear how PrepMaster helps candidates crack placements.</p>
        </div>

        <div className="max-w-4xl mx-auto relative glass-panel p-8 sm:p-12">
          <div className="absolute top-4 left-6 text-7xl text-primary/10 font-serif leading-none select-none">“</div>
          
          <div className="min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-base sm:text-lg text-slate-300 italic leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-bold flex items-center justify-center">
                    {testimonials[activeTestimonial].initial}
                  </div>
                  <div className="text-left">
                    <h5 className="text-sm font-bold text-white">{testimonials[activeTestimonial].author}</h5>
                    <p className="text-xs text-primary">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="p-2 border border-darkBorder hover:border-primary/50 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 border border-darkBorder hover:border-primary/50 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-darkBorder/40">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white Outfit">Simple, Transparent Pricing</h3>
          <p className="text-slate-400 mt-2">Invest in your career. Upgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* FREE PLAN */}
          <div className="glass-panel p-8 flex flex-col justify-between border-slate-800">
            <div>
              <h4 className="text-lg font-bold text-slate-300 uppercase tracking-wider">Free Starter</h4>
              <span className="text-3xl font-extrabold text-white mt-4 inline-block">$0</span>
              <p className="text-xs text-slate-500 mt-1">Forever Free plan</p>
              <ul className="text-sm text-slate-400 mt-8 space-y-3.5">
                <li>• 1 Resume ATS scan</li>
                <li>• 2 MCQ Aptitude tests</li>
                <li>• 1 Mock Interview session</li>
                <li>• Basic coding challenge arena</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full text-center px-4 py-3 bg-card border border-darkBorder text-slate-300 hover:text-white rounded-xl font-semibold mt-10 block transition-all"
            >
              Start Free
            </Link>
          </div>

          {/* PRO PLAN */}
          <div className="glass-panel p-8 flex flex-col justify-between border-primary glow-border-cyan relative transform scale-[1.02]">
            <div className="absolute top-4 right-4 bg-primary/20 text-primary border border-primary/30 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
              Most Popular
            </div>
            <div>
              <h4 className="text-lg font-bold text-primary uppercase tracking-wider">Pro Career</h4>
              <span className="text-3xl font-extrabold text-white mt-4 inline-block">$29</span>
              <p className="text-xs text-slate-500 mt-1">Billed monthly</p>
              <ul className="text-sm text-slate-300 mt-8 space-y-3.5">
                <li>• Unlimited Resume SWOT reviews</li>
                <li>• Unlimited Technical & Aptitude MCQs</li>
                <li>• Unlimited AI Mock Interviews</li>
                <li>• Full Sandbox Code Execution compiler</li>
                <li>• Personalized Learning Roadmaps</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full text-center px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110 rounded-xl font-semibold mt-10 block shadow-glow transition-all"
            >
              Go Pro
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="glass-panel p-8 flex flex-col justify-between border-slate-800">
            <div>
              <h4 className="text-lg font-bold text-slate-300 uppercase tracking-wider">Enterprise</h4>
              <span className="text-3xl font-extrabold text-white mt-4 inline-block">$99</span>
              <p className="text-xs text-slate-500 mt-1">Billed monthly</p>
              <ul className="text-sm text-slate-400 mt-8 space-y-3.5">
                <li>• Custom Company specific tests</li>
                <li>• Team mock interview groups</li>
                <li>• Super Admin control consoles</li>
                <li>• Dedicated priority API runtimes</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full text-center px-4 py-3 bg-card border border-darkBorder text-slate-300 hover:text-white rounded-xl font-semibold mt-10 block transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-darkBorder/40 bg-[#070b13] py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary text-white font-bold flex items-center justify-center text-xs">P</div>
            <span className="font-bold text-white tracking-wider">PrepMaster AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-text transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text transition-colors">FAQ</a>
            <a href="#" className="hover:text-text transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
