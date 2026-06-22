import { create } from "zustand";

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  activeTab: localStorage.getItem("prepmaster-active-tab") || "dashboard", // Persistent active view in dashboard
  targetRole: "Software Engineer",
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => {
    localStorage.setItem("prepmaster-active-tab", tab);
    set({ activeTab: tab });
  },
  setTargetRole: (role) => set({ targetRole: role })
}));
