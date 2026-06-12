import { useState } from "react";
import DirectoryItem from "./DirectoryItem";
import { LayoutGrid, List } from "lucide-react";

function DirectoryList({
  items,
  onItemDoubleClick,
  isUploading,
  uploadProgress,
  cancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  isReadOnlyAdmin,
}) {
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("drive-view-mode") || "grid"
  );

  const setMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("drive-view-mode", mode);
  };

  return (
    <div className="mt-4">
      {/* View toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => setMode("grid")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setMode("list")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            title="List view"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* List header (list mode only) */}
      {viewMode === "list" && (
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-3 pb-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 mb-1">
          <span>Name</span>
          <span>Size</span>
          <span>Modified</span>
          <span />
        </div>
      )}

      {/* Items */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
            : "flex flex-col gap-0.5"
        }
      >
        {items.map((item) => (
          <DirectoryItem
            key={item._id}
            item={item}
            viewMode={viewMode}
            onItemDoubleClick={onItemDoubleClick}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            cancelUpload={cancelUpload}
            handleDeleteFile={handleDeleteFile}
            handleDeleteDirectory={handleDeleteDirectory}
            isReadOnlyAdmin={isReadOnlyAdmin}
          />
        ))}
      </div>
    </div>
  );
}

export default DirectoryList;
