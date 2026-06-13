import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaChartPie, FaUsers, FaCog, FaShieldAlt } from "react-icons/fa";
import { getCurrentUser } from "./api/user.js";
import OverviewSection from "./components/admin/OverviewSection";
import UsersSection from "./components/admin/UsersSection";
import SettingsSection from "./components/admin/SettingsSection";

const ALLOWED_ROLES = ["Owner", "Admin"];

const TABS = [
  { id: "overview", label: "Overview", icon: FaChartPie, component: OverviewSection },
  { id: "users", label: "Users", icon: FaUsers, component: UsersSection },
  { id: "settings", label: "Settings", icon: FaCog, component: SettingsSection },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { section } = useParams();
  const activeTab = section || "overview";

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (currentUser && !ALLOWED_ROLES.includes(currentUser.role)) {
      navigate("/app");
    }
  }, [currentUser, navigate]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading…
        </div>
      </div>
    );
  }

  if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
    return null;
  }

  const ActiveComponent =
    TABS.find((t) => t.id === activeTab)?.component || OverviewSection;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* ─── Page header ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 pt-5 pb-0">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <FaShieldAlt size={13} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Admin Console
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Super user controls · {currentUser.name}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 -mb-px overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/app/admin/${tab.id}`)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 rounded-t-lg shrink-0
                  ${
                    isActive
                      ? "border-violet-500 text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/15"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
              >
                <tab.icon
                  className={`text-sm ${isActive ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
