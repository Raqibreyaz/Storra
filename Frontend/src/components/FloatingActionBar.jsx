import { Trash2, X, CheckCheck } from "lucide-react";

function FloatingActionBar({ selectedCount, totalCount, onClear, onDelete, onSelectAll }) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 px-6 py-3 bg-gray-900 text-white rounded-full shadow-2xl border border-gray-700 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3 border-r border-gray-700 pr-4">
          <span className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-sm font-medium whitespace-nowrap">Items selected</span>
        </div>

        <button
          onClick={onSelectAll}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all group ${
            allSelected
              ? "text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
          title={allSelected ? "Deselect All" : "Select All"}
        >
          <CheckCheck size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold">{allSelected ? "Deselect All" : "Select All"}</span>
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all group"
          title="Delete selected items"
        >
          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold">Delete</span>
        </button>

        <button
          onClick={onClear}
          className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          title="Clear selection"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default FloatingActionBar;
