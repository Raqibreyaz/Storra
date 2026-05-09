import { useState } from "react";

export default function SettingsSection() {
  // Mock state
  const [settings, setSettings] = useState({
    disableRegistrations: false,
    storageCapEnabled: true,
    storageCapValue: 500,
    storageCapUnit: "GB",
    uploadSizeEnabled: true,
    uploadSizeValue: 2,
    uploadSizeUnit: "GB",
    disableUploads: false,
    disableUpgrades: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const toggleSetting = (key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const updateSetting = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const units = ["MB", "GB", "TB"];
  const smallUnits = ["MB", "GB"];

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
          disabled={isSaving}
          className="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-wait"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Registration Settings */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Access Control</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Disable New User Registrations</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Prevent new users from signing up. Existing users can still log in.</div>
            </div>
            <ToggleSwitch checked={settings.disableRegistrations} onChange={() => toggleSetting('disableRegistrations')} />
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
                <div className={`flex items-center gap-2 transition-opacity ${settings.storageCapEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <input 
                    type="number" 
                    value={settings.storageCapValue}
                    onChange={(e) => updateSetting('storageCapValue', e.target.value)}
                    className="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <select 
                    value={settings.storageCapUnit}
                    onChange={(e) => updateSetting('storageCapUnit', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <ToggleSwitch checked={settings.storageCapEnabled} onChange={() => toggleSetting('storageCapEnabled')} />
              </div>
            </div>

            {/* Max File Upload Size */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">Max File Upload Size</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Maximum file size allowed per individual upload.</div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 transition-opacity ${settings.uploadSizeEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <input 
                    type="number" 
                    value={settings.uploadSizeValue}
                    onChange={(e) => updateSetting('uploadSizeValue', e.target.value)}
                    className="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <select 
                    value={settings.uploadSizeUnit}
                    onChange={(e) => updateSetting('uploadSizeUnit', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    {smallUnits.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <ToggleSwitch checked={settings.uploadSizeEnabled} onChange={() => toggleSetting('uploadSizeEnabled')} />
              </div>
            </div>

            {/* Disable Uploads */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-orange-600 dark:text-orange-400">Disable All File Uploads</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Temporarily pause all file uploads across the system (e.g. for maintenance).</div>
              </div>
              <ToggleSwitch checked={settings.disableUploads} onChange={() => toggleSetting('disableUploads')} color="orange" />
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
            <ToggleSwitch checked={settings.disableUpgrades} onChange={() => toggleSetting('disableUpgrades')} />
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
