import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  getAllUsers,
  logoutUser as apiLogoutUser,
  softDeleteUser as apiSoftDeleteUser,
  hardDeleteUser as apiHardDeleteUser,
  recoverUser as apiRecoverUser,
  changeUserRole as apiChangeUserRole,
} from "../../api/user.js";
import formatSize from "../../utils/formatSize.js";

const ROLES = ["Owner", "Admin", "Manager", "User"];
const ROLE_LEVEL = { Owner: 0, Admin: 1, Manager: 2, User: 3 };

export default function UsersSection() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const logoutMutation = useMutation({
    mutationFn: (userId) => apiLogoutUser(userId),
    onSuccess: invalidateUsers,
  });

  const softDeleteMutation = useMutation({
    mutationFn: (userId) => apiSoftDeleteUser(userId),
    onSuccess: invalidateUsers,
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (userId) => apiHardDeleteUser(userId),
    onSuccess: invalidateUsers,
  });

  const recoverMutation = useMutation({
    mutationFn: (userId) => apiRecoverUser(userId),
    onSuccess: invalidateUsers,
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => apiChangeUserRole(userId, newRole),
    onSuccess: invalidateUsers,
  });

  function canActOn(targetRole) {
    if (!currentUser) return false;
    return ROLE_LEVEL[currentUser.role] < ROLE_LEVEL[targetRole];
  }

  function getAssignableRoles() {
    if (!currentUser) return [];
    return ROLES.filter((r) => ROLE_LEVEL[currentUser.role] < ROLE_LEVEL[r]);
  }

  const logoutUser = (userId) => {
    if (!confirm("You are about to logout this user!")) return;
    logoutMutation.mutate(userId);
  };

  const softDeleteUser = (userId) => {
    if (!confirm("Soft-delete this user? Their account will be deactivated but can be recovered.")) return;
    softDeleteMutation.mutate(userId);
  };

  const hardDeleteUser = (userId) => {
    if (!confirm("⚠️ PERMANENTLY delete this user and ALL their data? This cannot be undone!")) return;
    hardDeleteMutation.mutate(userId);
  };

  const recoverUser = (userId) => {
    if (!confirm("Recover this user?")) return;
    recoverMutation.mutate(userId);
  };

  const changeRole = (userId, newRole) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    changeRoleMutation.mutate({ userId, newRole });
  };

  const assignableRoles = getAssignableRoles();
  const isOwner = currentUser?.role === "Owner";
  const isAdminOrOwner = currentUser?.role === "Admin" || currentUser?.role === "Owner";

  const actionBtnBase = "py-1.5 px-3 text-[13px] border-none rounded-lg font-medium text-white cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95";

  return (
    <div className="font-sans transition-colors bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <h2 className="m-0 text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage system users, assign roles, and control access.
        </p>
      </div>

      {(error || logoutMutation.error || softDeleteMutation.error || hardDeleteMutation.error || recoverMutation.error || changeRoleMutation.error) && (
        <div className="m-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 py-3 px-4 rounded-xl text-sm border border-red-200 dark:border-red-800/50">
          {error?.message || 
           logoutMutation.error?.message || 
           softDeleteMutation.error?.message || 
           hardDeleteMutation.error?.message || 
           recoverMutation.error?.message || 
           changeRoleMutation.error?.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Provider</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Storage</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Role</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
              {isAdminOrOwner && <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {isLoading ? (
              <tr><td colSpan={isAdminOrOwner ? 7 : 6} className="text-center p-10 text-gray-500 dark:text-gray-400 italic">Loading users...</td></tr>
            ) : users.map((user) => {
              if (user.email === currentUser?.email) return null;
              const isDeleted = user.isDeleted;
              if (isDeleted && !isOwner) return null;
              const userIsUnderMe = canActOn(user.role);

              return (
                <tr key={user._id} className={`${isDeleted ? "bg-red-50/50 dark:bg-red-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/20"} transition-colors`}>
                  <td className="p-4 dark:text-gray-300">
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    {isDeleted && (
                      <span className="inline-flex items-center mt-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] py-0.5 px-2 rounded-full font-bold uppercase tracking-wider">
                        deleted
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {user.authProvider || "Local"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 min-w-[140px]">
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">{formatSize(user.usedStorageInBytes)} / {formatSize(user.maxStorageInBytes)}</span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                          {((user.usedStorageInBytes || 0) / (user.maxStorageInBytes || 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${((user.usedStorageInBytes || 0) / (user.maxStorageInBytes || 1)) > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`} 
                          style={{ width: `${Math.min(((user.usedStorageInBytes || 0) / (user.maxStorageInBytes || 1)) * 100, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {userIsUnderMe && !isDeleted ? (
                      <select
                        className="py-1.5 px-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                        value={user.role}
                        onChange={(e) => changeRole(user._id, e.target.value)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role} disabled={!assignableRoles.includes(role)}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium transition-colors ${
                        user.isLoggedIn 
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                          : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isLoggedIn ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                      {user.isLoggedIn ? "Online" : "Offline"}
                    </span>
                  </td>
                  {isAdminOrOwner && (
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap items-center">
                        {isDeleted ? (
                          isOwner && (
                            <>
                              <button className={`${actionBtnBase} bg-emerald-500 hover:bg-emerald-600`} onClick={() => recoverUser(user._id)}>
                                Recover
                              </button>
                              <button className={`${actionBtnBase} bg-rose-600 hover:bg-rose-700`} onClick={() => hardDeleteUser(user._id)}>
                                Delete Permanently
                              </button>
                            </>
                          )
                        ) : userIsUnderMe ? (
                          <>
                            <button
                              className={`${actionBtnBase} bg-blue-500 hover:enabled:bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none`}
                              onClick={() => logoutUser(user._id)}
                              disabled={!user.isLoggedIn}
                            >
                              Logout
                            </button>
                            <button className={`${actionBtnBase} bg-orange-500 hover:bg-orange-600`} onClick={() => softDeleteUser(user._id)}>
                              Suspend
                            </button>
                            {isOwner && (
                              <button className={`${actionBtnBase} bg-rose-600 hover:bg-rose-700`} onClick={() => hardDeleteUser(user._id)}>
                                Delete
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
