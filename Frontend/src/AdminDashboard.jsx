import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  FaArrowLeft, 
  FaUsers, 
  FaCog, 
  FaChartPie, 
  FaShieldAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { getCurrentUser } from "./api/user.js";

import OverviewSection from "./components/admin/OverviewSection";
import UsersSection from "./components/admin/UsersSection";
import SettingsSection from "./components/admin/SettingsSection";

const ALLOWED_ROLES = ["Owner", "Admin", "Manager"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Redirect if not a super user
    if (currentUser && !ALLOWED_ROLES.includes(currentUser.role)) {
      navigate("/app");
    }
  }, [currentUser, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading Admin Dashboard...</div>
      </div>
    );
  }

  // Double check before rendering
  if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
    return null; // Will be redirected by useEffect
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: FaChartPie, component: OverviewSection },
    { id: "users", label: "User Management", icon: FaUsers, component: UsersSection },
    { id: "settings", label: "Global Settings", icon: FaCog, component: SettingsSection },
  ];

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || OverviewSection;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row transition-colors">
      
      {/* Mobile Header & Sidebar Toggle */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-lg">
          <FaShieldAlt />
          Admin Console
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-600 dark:text-gray-300 p-2 focus:outline-none"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-sm">
            <FaShieldAlt size={16} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white tracking-tight">Admin Console</span>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"}
                `}
              >
                <tab.icon className={`text-lg ${isActive ? "text-violet-600 dark:text-violet-400" : ""}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/app")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Super user controls and administration
            </p>
          </div>
          
          <ActiveComponent />
        </div>
      </main>

    </div>
  );
}
