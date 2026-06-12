import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaFolderPlus,
  FaUpload,
  FaChevronRight,
  FaSignOutAlt,
  FaUsers,
  FaCrown,
  FaShareAlt,
  FaTachometerAlt,
  FaHdd,
  FaBars,
  FaTimes,
  FaGoogleDrive,
} from "react-icons/fa";
import { Sun, Moon, Monitor } from "lucide-react";
import ProfileImage from "./ProfileImage";
import ThemeToggle from "./ThemeToggle";
import formatSize from "../utils/formatSize.js";
import { sanitizeText } from "../utils/sanitize.js";
import { getCurrentUser, logoutSelf, logoutAllDevices } from "../api/user.js";
import { confirmDialog } from "../store/uiStore";

// ─── NavItem ────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-150 group
        ${
          active
            ? "bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      title={collapsed ? label : undefined}
    >
      <Icon
        className={`shrink-0 text-base ${
          active
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

// ─── AppShell ────────────────────────────────────────────────────────────────
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem("sidebar-collapsed") !== "true"
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // ─── Current user ────────────────────────────────────────────────────────
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  const userName = userData ? sanitizeText(userData.name) : "Guest";
  const userEmail = userData?.email ?? "";
  const userRole = userData?.role ?? "User";
  const picture = userData?.picture ?? null;
  const maxStorage = userData?.maxStorageInBytes ?? 1073741824;
  const usedStorage = userData?.usedStorageInBytes ?? 0;
  const storagePercent = Math.min((usedStorage / maxStorage) * 100, 100);
  const storageBarColor =
    storagePercent > 90
      ? "bg-red-500"
      : storagePercent > 70
      ? "bg-amber-500"
      : "bg-blue-500";

  // ─── Logout mutations ────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: logoutSelf,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      navigate("/login");
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: logoutAllDevices,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      navigate("/login");
    },
  });

  const handleLogout = () => {
    confirmDialog({
      title: "Logout",
      message: "Do you really want to logout?",
      confirmText: "Logout",
      isDestructive: true,
      onConfirm: () => logoutMutation.mutate()
    });
    setShowUserMenu(false);
  };

  const handleLogoutAll = () => {
    confirmDialog({
      title: "Logout All Devices",
      message: "You are about to logout all sessions! Proceed?",
      confirmText: "Logout All",
      isDestructive: true,
      onConfirm: () => logoutAllMutation.mutate()
    });
    setShowUserMenu(false);
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sidebar toggle persisted
  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      localStorage.setItem("sidebar-collapsed", String(prev));
      return !prev;
    });
  };

  // Close sidebar on mobile route change
  useEffect(() => {
    if (window.innerWidth < 768) {
      setTimeout(() => setSidebarOpen(false), 0);
    }
  }, [location.pathname]);

  const isActive = (prefix) => location.pathname.startsWith(prefix);

  // ─── Nav items ───────────────────────────────────────────────────────────
  const navItems = [
    {
      icon: FaHdd,
      label: "My Drive",
      path: "/app",
      active:
        isActive("/app") &&
        !isActive("/app/admin") &&
        !isActive("/app/shared") &&
        !isActive("/app/dashboard"),
      onClick: () => navigate("/app"),
    },
    {
      icon: FaShareAlt,
      label: "Shared with Me",
      path: "/app/shared",
      active: isActive("/app/shared"),
      onClick: () => navigate("/app/shared"),
    },
    {
      icon: FaTachometerAlt,
      label: "My Account",
      path: "/app/dashboard",
      active: isActive("/app/dashboard"),
      onClick: () => navigate("/app/dashboard"),
    },
    ...(userRole !== "User"
      ? [
          {
            icon: FaUsers,
            label: "Admin Console",
            path: "/app/admin",
            active: isActive("/app/admin"),
            onClick: () => navigate("/app/admin"),
          },
        ]
      : []),
    {
      icon: FaCrown,
      label: "Upgrade Plan",
      path: "/plans",
      active: false,
      onClick: () => navigate("/plans"),
    },
  ];

  const sidebarW = sidebarOpen ? "w-56" : "w-14";
  // CSS custom property so FloatingActionBar can centre itself in the content area
  const sidebarPx = sidebarOpen ? 224 : 56; // 14rem = 224px, 3.5rem = 56px

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors"
      style={{ "--sidebar-w": `${sidebarPx}px` }}
    >
      {/* ─── Sidebar overlay (mobile) ──────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`${sidebarW} shrink-0 flex flex-col h-full
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-all duration-200 overflow-hidden z-50
          fixed inset-y-0 left-0 md:relative md:inset-auto`}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-2.5 px-3 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
            !sidebarOpen && "justify-center"
          }`}
          onClick={() => navigate("/app")}
          title="My Drive"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
            <FaGoogleDrive className="text-white text-sm" />
          </div>
          {sidebarOpen && (
            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              MyDrive
            </span>
          )}
        </div>


        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5 mt-1">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>

        {/* Storage bar */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Storage
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {storagePercent.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${storageBarColor} transition-all duration-500`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
              {formatSize(usedStorage)} of {formatSize(maxStorage)}
            </p>
          </div>
        )}

        {/* User avatar at bottom */}
        <div
          className={`px-2 pb-3 shrink-0 relative`}
          ref={userMenuRef}
        >
          <button
            onClick={() => setShowUserMenu((p) => !p)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
              ${!sidebarOpen && "justify-center"}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {picture ? (
                <ProfileImage src={picture} />
              ) : (
                <span className="text-white text-xs font-bold">
                  {userName?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">
                  {userEmail}
                </p>
              </div>
            )}
          </button>

          {/* User popover menu — only when sidebar is expanded (prevents narrow-width weirdness) */}
          {showUserMenu && sidebarOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  {userEmail}
                </p>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="text-gray-400 text-xs shrink-0" />
                Logout
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                onClick={handleLogoutAll}
              >
                <FaSignOutAlt className="text-red-400 text-xs shrink-0" />
                Logout all devices
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main content area ─────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-200
          ${ sidebarOpen ? "ml-56 md:ml-0" : "ml-14 md:ml-0" }`}
      >
        {/* ─── Top bar ──────────────────────────────────────────────────── */}
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          {/* Hamburger */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
          </button>

          {/* Breadcrumb — rendered by child page via portal / outlet context */}
          <BreadcrumbSlot />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons (only shown on /app drive pages) */}
          <DriveActions />

          {/* Theme toggle */}
          <ThemeToggle />
        </header>

        {/* ─── Page content ─────────────────────────────────────────────── */}
        <main
          className="flex-1 min-h-0 overflow-y-auto"
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── BreadcrumbSlot ──────────────────────────────────────────────────────────
// Reads breadcrumb data set by DriveHeader (the simplified header inside DirectoryView).
// We expose a simple global event / context mechanism so DirectoryView can push
// breadcrumb data without prop drilling.
function BreadcrumbSlot() {
  // Breadcrumb is provided by the <DrivePageHeader> component that DirectoryView renders
  // via the AppShellContext (see below). For pages that don't provide it, we show nothing.
  const [crumb, setCrumb] = useState(null);

  useEffect(() => {
    const handler = (e) => setCrumb(e.detail);
    window.addEventListener("drive:breadcrumb", handler);
    return () => window.removeEventListener("drive:breadcrumb", handler);
  }, []);

  if (!crumb) return null;

  const { navigate, targetUserId, directoryPath, directoryName } = crumb;

  return (
    <div className="flex items-center gap-1 text-sm font-medium overflow-x-auto hide-scrollbar">
      <button
        className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
        onClick={() =>
          navigate(
            targetUserId
              ? `/app/admin/users/${targetUserId}`
              : "/app"
          )
        }
      >
        {targetUserId ? "User's Drive" : "My Drive"}
      </button>
      {directoryPath?.slice(1).map((folder) => (
        <span key={folder._id} className="flex items-center gap-1 shrink-0">
          <FaChevronRight className="text-[10px] text-gray-400" />
          <button
            className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[120px]"
            onClick={() =>
              navigate(
                targetUserId
                  ? `/app/admin/users/${targetUserId}/directory/${folder._id}`
                  : `/app/directory/${folder._id}`
              )
            }
            title={folder.name}
          >
            {folder.name}
          </button>
        </span>
      ))}
      {directoryName &&
        directoryName !== "My Drive" &&
        directoryName !== "User's Drive" && (
          <span className="flex items-center gap-1 shrink-0">
            <FaChevronRight className="text-[10px] text-gray-400" />
            <span
              className="text-gray-600 dark:text-gray-300 truncate max-w-[150px]"
              title={directoryName}
            >
              {directoryName}
            </span>
          </span>
        )}
    </div>
  );
}

// ─── DriveActions ─────────────────────────────────────────────────────────────
// Upload / New Folder buttons — only visible on drive pages
function DriveActions() {
  const [actions, setActions] = useState(null);

  useEffect(() => {
    const handler = (e) => setActions(e.detail);
    window.addEventListener("drive:actions", handler);
    return () => window.removeEventListener("drive:actions", handler);
  }, []);

  if (!actions) return null;

  const { onCreateFolderClick, onUploadFilesClick, disabled } = actions;

  return (
    <div className="flex items-center gap-2 shrink-0">
      {onCreateFolderClick && (
        <button
          onClick={onCreateFolderClick}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
            text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700
            hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600
            disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <FaFolderPlus size={13} className="text-blue-500" />
          <span className="hidden sm:inline">New Folder</span>
        </button>
      )}
      {onUploadFilesClick && (
        <button
          onClick={onUploadFilesClick}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white
            disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <FaUpload size={12} />
          <span className="hidden sm:inline">Upload</span>
        </button>
      )}
    </div>
  );
}
