import { FaUsers, FaCloudUploadAlt, FaDatabase, FaServer, FaArrowUp } from "react-icons/fa";

export default function OverviewSection() {
  // Mock data for the overview section
  const stats = [
    {
      label: "Total Active Users",
      value: "1,248",
      trend: "+12% this month",
      icon: FaUsers,
      color: "blue",
    },
    {
      label: "Total Storage Used",
      value: "84.5 TB",
      trend: "+4.2 TB this week",
      icon: FaDatabase,
      color: "violet",
    },
    {
      label: "Files Uploaded (30d)",
      value: "142,093",
      trend: "+18% from last month",
      icon: FaCloudUploadAlt,
      color: "emerald",
    },
    {
      label: "System Uptime",
      value: "99.99%",
      trend: "All systems operational",
      icon: FaServer,
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="font-sans transition-colors bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
        <h2 className="m-0 text-xl font-bold text-gray-900 dark:text-white">System Overview</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A high-level view of your application's current state and usage metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="font-sans transition-colors bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="text-xl" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1.5">
              {stat.trend.startsWith("+") && <FaArrowUp className="text-[10px] text-emerald-500" />}
              <span className="text-xs text-gray-500 dark:text-gray-400">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Mock */}
      <div className="font-sans transition-colors bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="m-0 text-lg font-bold text-gray-900 dark:text-white">Recent System Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {[
              { time: "10 mins ago", event: "New user registration: john.doe@example.com", type: "user" },
              { time: "1 hour ago", event: "Large file upload completed (2.4 GB) by jane.smith", type: "upload" },
              { time: "3 hours ago", event: "System automated backup completed successfully", type: "system" },
              { time: "5 hours ago", event: "Admin 'Owner' updated global storage limits", type: "admin" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{activity.event}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
