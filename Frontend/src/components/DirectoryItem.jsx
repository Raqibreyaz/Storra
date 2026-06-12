import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "../components/ContextMenu";
import formatSize from "../utils/formatSize";
import { formatDate } from "../utils/date";
import FileIcon from "./common/FileIcon";
import useDriveStore from "../store/driveStore";

function DirectoryItem({
  item,
  viewMode,
  onItemDoubleClick,
  isUploading,
  uploadProgress,
  cancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  isReadOnlyAdmin,
}) {
  // ─── Store reads ──────────────────────────────────────────────────────────
  const selection = useDriveStore((s) => s.selection);
  const handleItemClick = useDriveStore((s) => s.handleItemClick);
  const contextMenu = useDriveStore((s) => s.contextMenu);
  const handleContextMenu = useDriveStore((s) => s.handleContextMenu);
  const openRename = useDriveStore((s) => s.openRename);
  const openShare = useDriveStore((s) => s.openShare);
  const openAccess = useDriveStore((s) => s.openAccess);
  const openDetails = useDriveStore((s) => s.openDetails);

  const isUploadingItem = item._id.startsWith("temp-");
  const isSelected = item.isDirectory
    ? selection.dirs.includes(item._id)
    : selection.files.includes(item._id);
  const isMenuOpen = contextMenu.activeId === item._id;

  const handleClick = (e) => {
    if (contextMenu.activeId || isUploading) return;
    e.stopPropagation();
    handleItemClick(item._id, item.isDirectory, e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = (e) => {
    if (contextMenu.activeId || isUploading) return;
    e.stopPropagation();
    onItemDoubleClick(item.isDirectory ? "directory" : "file", item._id);
  };

  const onThreeDotsClick = (e) => {
    e.stopPropagation();
    handleContextMenu(e, item._id);
  };

  // ─── Grid card ────────────────────────────────────────────────────────────
  if (viewMode === "grid") {
    return (
      <div
        className={`group relative flex flex-col items-center gap-2 p-3 pt-4 rounded-2xl cursor-pointer
          select-none transition-all duration-200 border
          ${
            isSelected
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/25 shadow-sm shadow-blue-100 dark:shadow-blue-900/20"
              : "border-transparent bg-gray-50 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/40"
          }`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => handleContextMenu(e, item._id)}
      >
        {/* Selection checkbox */}
        <div
          className={`absolute top-2 left-2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 ${
            isSelected
              ? "opacity-100 bg-blue-500 border-blue-500"
              : "opacity-0 group-hover:opacity-100 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleItemClick(item._id, item.isDirectory, true);
          }}
        >
          {isSelected && (
            <svg
              viewBox="0 0 10 8"
              className="w-2.5 h-2.5 text-white fill-none stroke-current stroke-2"
            >
              <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Three-dot menu */}
        <button
          className="absolute top-1.5 right-1.5 p-1 rounded-lg text-gray-400 dark:text-gray-500
            hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300
            opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
          onClick={onThreeDotsClick}
          title="More options"
        >
          <BsThreeDotsVertical size={13} />
        </button>

        {/* File icon */}
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700/80 shadow-sm">
          <FileIcon
            filename={item.name}
            isDirectory={item.isDirectory}
            className="text-3xl"
          />
        </div>

        {/* Name */}
        <span
          className={`text-xs font-medium text-center leading-tight line-clamp-2 w-full px-1
            ${isSelected ? "text-blue-800 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"}`}
          title={item.name}
        >
          {item.name}
        </span>

        {/* Upload progress */}
        {isUploadingItem && (
          <div className="w-full flex flex-col gap-1">
            <span className="text-[10px] text-center text-gray-500 dark:text-gray-400 font-medium">
              {Math.floor(uploadProgress)}%
            </span>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  uploadProgress === 100 ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}


        {/* Context menu */}
        {isMenuOpen && (
          <ContextMenu
            item={item}
            contextMenuPos={contextMenu.pos}
            isUploadingItem={isUploadingItem}
            cancelUpload={cancelUpload}
            handleDeleteFile={handleDeleteFile}
            handleDeleteDirectory={handleDeleteDirectory}
            isReadOnlyAdmin={isReadOnlyAdmin}
          />
        )}
      </div>
    );
  }

  // ─── List row ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer
        select-none transition-all duration-150 border
        ${
          isSelected
            ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
            : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:border-gray-100 dark:hover:border-gray-700"
        }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => handleContextMenu(e, item._id)}
    >
      {/* Checkbox */}
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
          isSelected
            ? "bg-blue-500 border-blue-500"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handleItemClick(item._id, item.isDirectory, true);
        }}
      >
        {isSelected && (
          <svg
            viewBox="0 0 10 8"
            className="w-2.5 h-2.5 text-white fill-none stroke-current stroke-2"
          >
            <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <FileIcon
        filename={item.name}
        isDirectory={item.isDirectory}
        className="text-lg shrink-0"
      />

      {/* Name */}
      <span
        className={`flex-1 truncate text-sm font-medium
          ${isSelected ? "text-blue-800 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"}`}
        title={item.name}
      >
        {item.name}
      </span>

      {/* Size & date — hidden on very small screens */}
      <span className="hidden sm:block w-24 text-right text-xs text-gray-400 dark:text-gray-500 shrink-0">
        {item.isDirectory ? "—" : formatSize(item.size)}
      </span>
      <span className="hidden sm:block w-28 text-right text-xs text-gray-400 dark:text-gray-500 shrink-0">
        {formatDate(item.updatedAt)}
      </span>

      {isUploadingItem && (
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
          {Math.floor(uploadProgress)}%
        </span>
      )}

      {/* Three-dot */}
      <button
        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500
          hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300
          opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
        onClick={onThreeDotsClick}
        title="More options"
      >
        <BsThreeDotsVertical size={14} />
      </button>

      {/* Upload progress bar */}
      {isUploadingItem && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${uploadProgress === 100 ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Context menu */}
      {isMenuOpen && (
        <ContextMenu
          item={item}
          contextMenuPos={contextMenu.pos}
          isUploadingItem={isUploadingItem}
          cancelUpload={cancelUpload}
          handleDeleteFile={handleDeleteFile}
          handleDeleteDirectory={handleDeleteDirectory}
          isReadOnlyAdmin={isReadOnlyAdmin}
        />
      )}
    </div>
  );
}

export default DirectoryItem;
