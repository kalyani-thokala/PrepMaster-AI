import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { user, authLoading: isLoading, updateProfile } = useAuth();

  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [skills, setSkills] = useState(user?.profile?.skills?.join(", ") || "");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const skillsArray = skills
      ? skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    const res = await updateProfile({ bio, skills: skillsArray });
    if (res.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(res.error || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-3xl w-full mx-auto">
          <div className="glass-panel p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-darkBorder pb-4">
              <h2 className="text-xl font-bold text-white Outfit">Candidate Profile Settings</h2>
              <p className="text-xs text-slate-400 mt-1">Configure your personal placement preparation details</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Account info */}
              <div className="grid grid-cols-2 gap-4 bg-[#0b0f19]/30 p-4 rounded-xl border border-darkBorder">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Candidate name</span>
                  <p className="text-sm font-semibold text-white mt-0.5">{user?.fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email address</span>
                  <p className="text-sm font-semibold text-white mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Bio editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Short Introduction Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-24 glass-input bg-[#0b0f19] resize-none leading-relaxed text-xs"
                  placeholder="Tell recruiters about your background..."
                />
              </div>

              {/* Skills editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Current Skill Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full glass-input text-xs"
                  placeholder="e.g. React, Node.js, Python, CSS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-darkBorder">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {isLoading ? "Saving changes..." : "Save Settings"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
