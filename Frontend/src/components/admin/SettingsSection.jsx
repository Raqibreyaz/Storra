import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getAppSettings, updateAppSettings } from "../../api/settings.js";

// Helper to convert bytes to readable unit and value
function bytesToUnitValue(bytes) {
  if (bytes == null) return { value: '', unit: 'MB' };
  if (bytes === 0) return { value: 0, unit: 'B' };
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const targetIndex = Math.min(i, sizes.indexOf('TB'));

  return {
    value: parseFloat((bytes / Math.pow(k, i)).toFixed(2)),
    unit: sizes[targetIndex]
  };
}

// Helper to convert unit and value to bytes
function unitValueToBytes(value, unit) {
  if (value === '' || value == null) return null;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = sizes.indexOf(unit);
  if (i === -1) return Number(value);
  return Number(value) * Math.pow(k, i);
}

export default function SettingsSection() {
  const queryClient = useQueryClient();

  const { data: backendData, isLoading, } = useQuery({
    queryKey: ["appSettings"],
    queryFn: getAppSettings,
  });

  const appSettingsMutation = useMutation({
    mutationFn: (newSettings) => updateAppSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appSettings"] });
    }
  });

  const [localState, setLocalState] = useState(null)

  useEffect(() => {
    if (backendData) {
      console.log(backendData)
      const { appSettings } = backendData
      const storageCap = bytesToUnitValue(appSettings?.globalObjectStorageCap?.bytesLimit);
      const uploadSize = bytesToUnitValue(appSettings?.maxFileUploadSize?.bytesLimit);

      setLocalState({
        newRegistrationDisabled: appSettings?.newRegistrationDisabled ?? false,

        storageCapEnabled: appSettings?.globalObjectStorageCap?.enabled ?? false,
        storageCapValue: storageCap.value,
        storageCapUnit: storageCap.unit,

        uploadSizeEnabled: appSettings?.maxFileUploadSize?.enabled ?? false,
        uploadSizeValue: uploadSize.value,
        uploadSizeUnit: uploadSize.unit,

        fileUploadDisabled: appSettings?.fileUploadDisabled ?? false,
        freePlanUpgradeDisabled: appSettings?.freePlanUpgradeDisabled ?? false,

        noOfUsersAllowedEnabled: appSettings?.noOfUsersAllowed?.enabled ?? false,
        noOfUsersAllowedCount: appSettings?.noOfUsersAllowed?.count ?? 10,
      });
    }
  }, [backendData]);

  const [errors, setErrors] = useState({});

  if (isLoading || !localState) {
    return (
      <div className="font-sans transition-colors bg-white dark:bg-gray-800 rounded-2xl p-6 text-center text-gray-500">
        Loading global settings...
      </div>
    );
  }

  const toggleSetting = (key) => {
    setLocalState((s) => ({ ...s, [key]: !s[key] }));
  };

  const updateSetting = (key, value) => {
    setLocalState((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    // Validation
    const newErrors = {};
    if (localState.storageCapEnabled && (localState.storageCapValue === '' || localState.storageCapValue < 0)) {
      newErrors.storageCap = "Please enter a valid non-negative number";
    }
    if (localState.uploadSizeEnabled && (localState.uploadSizeValue === '' || localState.uploadSizeValue < 0)) {
      newErrors.uploadSize = "Please enter a valid non-negative number";
    }
    if (localState.noOfUsersAllowedEnabled && (localState.noOfUsersAllowedCount === '' || localState.noOfUsersAllowedCount < 1)) {
      newErrors.noOfUsers = "Please enter a valid number (minimum 1)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const payload = {
      newRegistrationDisabled: localState.newRegistrationDisabled,
      globalObjectStorageCap: {
        enabled: localState.storageCapEnabled,
        bytesLimit: unitValueToBytes(localState.storageCapValue, localState.storageCapUnit),
      },
      maxFileUploadSize: {
        enabled: localState.uploadSizeEnabled,
        bytesLimit: unitValueToBytes(localState.uploadSizeValue, localState.uploadSizeUnit),
      },
      noOfUsersAllowed: {
        enabled: localState.noOfUsersAllowedEnabled,
        count: parseInt(localState.noOfUsersAllowedCount),
      },
      fileUploadDisabled: localState.fileUploadDisabled,
      freePlanUpgradeDisabled: localState.freePlanUpgradeDisabled,
    };
    appSettingsMutation.mutate(payload);
  };

  const units = ["B", "KB", "MB", "GB", "TB"];
  const smallUnits = ["B", "KB", "MB", "GB"];

  console.log(localState)

  return (
    <div className="font-sans transition-colors bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
        <div>
          <h2 className="m-0 text-xl font-bold text-gray-900 dark:text-white">Global Settings</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system-wide configuration and limits.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={appSettingsMutation.isPending}
          className="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-wait"
        >
          {appSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="p-6 space-y-8">

        {appSettingsMutation.isSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm">
            Settings saved successfully!
          </div>
        )}
        {appSettingsMutation.isError && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            Failed to save settings: {appSettingsMutation.error?.message || "Unknown error"}
          </div>
        )}

        {/* Registration Settings */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Access Control</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Disable New User Registrations</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Prevent new users from signing up. Existing users can still log in.</div>
              </div>
              <ToggleSwitch checked={localState.newRegistrationDisabled} onChange={() => toggleSetting('newRegistrationDisabled')} />
            </div>

            {/* Max Users Allowed */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">Maximum User Limit</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Limit the total number of registered users in the system.</div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex flex-col items-end transition-opacity ${localState.noOfUsersAllowedEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={localState.noOfUsersAllowedCount}
                      onChange={(e) => updateSetting('noOfUsersAllowedCount', e.target.value)}
                      className={`w-24 px-3 py-1.5 border ${errors.noOfUsers ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50`}
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Users</span>
                  </div>
                  {errors.noOfUsers && <span className="text-[10px] text-red-500 mt-1 font-medium">{errors.noOfUsers}</span>}
                </div>
                <ToggleSwitch checked={localState.noOfUsersAllowedEnabled} onChange={() => toggleSetting('noOfUsersAllowedEnabled')} />
              </div>
            </div>
          </div>
        </div>

        {/* Storage Limits */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Storage Limits</h3>

          <div className="space-y-4">
            {/* Total Storage Cap */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">Total AWS Bucket Storage Cap</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Maximum allowed storage across all users in the S3 bucket.</div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex flex-col items-end transition-opacity ${localState.storageCapEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={localState.storageCapValue}
                      onChange={(e) => updateSetting('storageCapValue', e.target.value)}
                      className={`w-24 px-3 py-1.5 border ${errors.storageCap ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50`}
                    />
                    <select
                      value={localState.storageCapUnit}
                      onChange={(e) => updateSetting('storageCapUnit', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  {errors.storageCap && <span className="text-[10px] text-red-500 mt-1 font-medium">{errors.storageCap}</span>}
                </div>
                <ToggleSwitch checked={localState.storageCapEnabled} onChange={() => toggleSetting('storageCapEnabled')} />
              </div>
            </div>

            {/* Max File Upload Size */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">Max File Upload Size</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Maximum file size allowed per individual upload.</div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex flex-col items-end transition-opacity ${localState.uploadSizeEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={localState.uploadSizeValue}
                      onChange={(e) => updateSetting('uploadSizeValue', e.target.value)}
                      className={`w-24 px-3 py-1.5 border ${errors.uploadSize ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50`}
                    />
                    <select
                      value={localState.uploadSizeUnit}
                      onChange={(e) => updateSetting('uploadSizeUnit', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      {smallUnits.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  {errors.uploadSize && <span className="text-[10px] text-red-500 mt-1 font-medium">{errors.uploadSize}</span>}
                </div>
                <ToggleSwitch checked={localState.uploadSizeEnabled} onChange={() => toggleSetting('uploadSizeEnabled')} />
              </div>
            </div>

            {/* Disable Uploads */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-orange-600 dark:text-orange-400">Disable All File Uploads</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Temporarily pause all file uploads across the system (e.g. for maintenance).</div>
              </div>
              <ToggleSwitch checked={localState.fileUploadDisabled} onChange={() => toggleSetting('fileUploadDisabled')} color="orange" />
            </div>
          </div>
        </div>

        {/* Billing / Subscriptions */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Billing & Subscriptions</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Disable Upgrades from Free Plan</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Prevent users from purchasing new subscriptions or upgrading. Existing subscriptions will continue.</div>
            </div>
            <ToggleSwitch checked={localState.freePlanUpgradeDisabled} onChange={() => toggleSetting('freePlanUpgradeDisabled')} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple toggle switch component
function ToggleSwitch({ checked, onChange, color = "violet" }) {
  const bgClass = checked
    ? (color === 'orange' ? 'bg-orange-500' : 'bg-violet-500')
    : 'bg-gray-300 dark:bg-gray-600';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2 ${bgClass}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}
