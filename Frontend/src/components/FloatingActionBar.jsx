import { Trash2, X, CheckCheck } from "lucide-react";
import useDriveStore from "../store/driveStore";

function FloatingActionBar({ totalCount, onDelete, onSelectAll }) {
  const selection = useDriveStore((s) => s.selection);
  const clearSelection = useDriveStore((s) => s.clearSelection);

  const selectedCount = selection.dirs.length + selection.files.length;

  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div
      className="left-1/2 fixed bottom-6 right-0 z-20 pointer-events-none transition-all duration-200 flex justify-center px-4"
      style={{
        // left: "var(--sidebar-w, 0px)",
      }}
    >
      <div
        className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5
          bg-gray-900/95 dark:bg-gray-800/95 text-white rounded-2xl
          shadow-2xl border border-gray-700 dark:border-gray-600
          backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-full overflow-x-auto hide-scrollbar"
      >
        {/* Count badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 pr-2.5 sm:pr-3 border-r border-gray-700">
          <span className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full text-[10px] font-bold shrink-0">
            {selectedCount}
          </span>
          <span className="text-sm font-medium whitespace-nowrap text-gray-200 hidden sm:inline">
            selected
          </span>
        </div>

        {/* Select all / deselect all */}
        <button
          onClick={onSelectAll}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-sm font-medium transition-all ${
            allSelected
              ? "text-blue-300 hover:bg-blue-500/20"
              : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
          }`}
          title={allSelected ? "Deselect All" : "Select All"}
        >
          <CheckCheck size={15} />
          <span className="hidden sm:inline">
            {allSelected ? "Deselect All" : "Select All"}
          </span>
        </button>

        {/* Delete */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-sm font-medium
              text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
            title="Delete selected"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}

        {/* Clear */}
        <button
          onClick={clearSelection}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700/70 hover:text-white transition-all"
          title="Clear selection"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default FloatingActionBar;
