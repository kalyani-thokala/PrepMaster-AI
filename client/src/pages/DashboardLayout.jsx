import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import { useUiStore } from "../store/uiStore.js";

// Import dynamic sub-pages
import OverviewDashboard from "./subpages/OverviewDashboard.jsx";
import ResumeAnalyzer from "./subpages/ResumeAnalyzer.jsx";
import MockInterview from "./subpages/MockInterview.jsx";
import CodingArena from "./subpages/CodingArena.jsx";
import AptitudePortal from "./subpages/AptitudePortal.jsx";
import CareerCoach from "./subpages/CareerCoach.jsx";
import RoadmapVisualizer from "./subpages/RoadmapVisualizer.jsx";
import AdminDashboard from "./subpages/AdminDashboard.jsx";
import Leaderboard from "./subpages/Leaderboard.jsx";
import CompanyPrep from "./subpages/CompanyPrep.jsx";
import Notifications from "./subpages/Notifications.jsx";

const DashboardLayout = () => {
  const { activeTab } = useUiStore();

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <OverviewDashboard />;
      case "resume":
        return <ResumeAnalyzer />;
      case "interview":
        return <MockInterview />;
      case "coding":
        return <CodingArena />;
      case "aptitude":
        return <AptitudePortal />;
      case "coach":
        return <CareerCoach />;
      case "roadmap":
        return <RoadmapVisualizer />;
      case "admin":
        return <AdminDashboard />;
      case "leaderboard":
        return <Leaderboard />;
      case "company":
        return <CompanyPrep />;
      case "notifications":
        return <Notifications />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Navigation sidebar */}
      <Sidebar />

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky navbar */}
        <Navbar />

        {/* Dynamic page container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
