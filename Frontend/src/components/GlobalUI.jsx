import { useEffect } from "react";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import useUIStore from "../store/uiStore";

export default function GlobalUI() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);
  const confirmDialog = useUIStore((s) => s.confirmDialog);
  const closeConfirm = useUIStore((s) => s.closeConfirm);

  // Esc to close confirm
  useEffect(() => {
    if (!confirmDialog) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (confirmDialog.onCancel) confirmDialog.onCancel();
        closeConfirm();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmDialog, closeConfirm]);

  return (
    <>
      {/* ─── Toasts ──────────────────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-4 duration-300
              bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-sm"
          >
            {t.type === "success" && <CheckCircle className="text-green-500 shrink-0" size={18} />}
            {t.type === "error" && <AlertCircle className="text-red-500 shrink-0" size={18} />}
            {t.type === "info" && <Info className="text-blue-500 shrink-0" size={18} />}
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ─── Confirm Dialog ──────────────────────────────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${confirmDialog.isDestructive ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                  {confirmDialog.isDestructive ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {confirmDialog.title || "Confirm Action"}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-13">
                {confirmDialog.message}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  closeConfirm();
                }}
                className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {confirmDialog.cancelText || "Cancel"}
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirm();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-xl text-white shadow-sm transition-colors ${
                  confirmDialog.isDestructive
                    ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                }`}
              >
                {confirmDialog.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
