import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import toast from "react-hot-toast";
import apiClient from "../services/api.js";

const Profile = () => {
  const { user, authLoading, updateProfile } = useAuth();
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBio(user?.profile?.bio || "");
    setSkills(user?.profile?.skills?.join(", ") || "");
  }, [user]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      bio: bio.trim(),
      skills: skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    const response = await updateProfile(payload);
    
    // Also sync profile updates to the backend MongoDB user document
    if (response.success) {
      try {
        await apiClient.put("/auth/profile", payload);
      } catch (backendErr) {
        console.warn("Backend profile sync failed:", backendErr);
      }
    }
    
    setSaving(false);

    if (response.success) {
      toast.success("Profile saved successfully.");
    } else {
      toast.error(response.error || "Profile save failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl w-full mx-auto">
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="border-b border-darkBorder pb-4">
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <p className="text-sm text-slate-400 mt-2">Update your account details and Firestore profile data.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
                  <input
                    disabled
                    value={user?.displayName || user?.profile?.displayName || ""}
                    className="w-full glass-input bg-slate-950/80"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Email</label>
                  <input
                    disabled
                    value={user?.email || ""}
                    className="w-full glass-input bg-slate-950/80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full glass-input min-h-[140px] resize-none"
                  placeholder="Tell us about yourself"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Skills</label>
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full glass-input"
                  placeholder="React, Node.js, Firebase"
                />
                <p className="text-xs text-slate-500 mt-2">Comma-separated values are stored in Firestore.</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={authLoading || saving}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
