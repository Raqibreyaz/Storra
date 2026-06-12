import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import ShareModal from "./components/ShareModal";
import AccessControlModal from "./components/AccessControlModal";
import DetailsModal from "./components/DetailsModal";
import DirectoryList from "./components/DirectoryList";
import FloatingActionBar from "./components/FloatingActionBar";
import DrivePageHeader from "./components/DrivePageHeader";
import {
  getDirectory,
  createDirectory,
  deleteDirectory,
  renameDirectory,
} from "./api/directory.js";
import { deleteFile, renameFile, getFileUrl } from "./api/file.js";
import { bulkDeleteItems } from "./api/item.js";
import { sanitizeText } from "./utils/sanitize.js";
import useUpload from "./hooks/useUpload";
import useDriveStore from "./store/driveStore";
import { confirmDialog } from "./store/uiStore";

function DirectoryView() {
  const { dirId, targetUserId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // ─── Store selectors ──────────────────────────────────────────────────────
  const modals = useDriveStore((s) => s.modals);
  const modalData = useDriveStore((s) => s.modalData);
  const selection = useDriveStore((s) => s.selection);
  const setModalData = useDriveStore((s) => s.setModalData);
  const closeCreateDir = useDriveStore((s) => s.closeCreateDir);
  const closeRename = useDriveStore((s) => s.closeRename);
  const closeShare = useDriveStore((s) => s.closeShare);
  const closeAccess = useDriveStore((s) => s.closeAccess);
  const closeDetails = useDriveStore((s) => s.closeDetails);
  const clearSelection = useDriveStore((s) => s.clearSelection);
  const resetSelectionForDir = useDriveStore((s) => s.resetSelectionForDir);
  const toggleSelectAll = useDriveStore((s) => s.toggleSelectAll);
  const closeContextMenu = useDriveStore((s) => s.closeContextMenu);

  // ─── Current user ─────────────────────────────────────────────────────────
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => import("./api/user.js").then((m) => m.getCurrentUser()),
    staleTime: 5 * 60 * 1000,
  });

  const isReadOnlyAdmin =
    targetUserId &&
    currentUser?.role === "Admin" &&
    currentUser?._id !== targetUserId;

  // ─── Directory data ───────────────────────────────────────────────────────
  const {
    data: directoryData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["directory", targetUserId || "me", dirId || "root"],
    queryFn: () => getDirectory(dirId, targetUserId),
    retry: false,
  });

  const [dirNotFound, setDirNotFound] = useState(false);
  useEffect(() => {
    setDirNotFound(queryError?.errorCode === "DIR_NOT_FOUND");
  }, [queryError]);

  // Reset selection whenever directory changes
  useEffect(() => {
    resetSelectionForDir();
  }, [dirId, resetSelectionForDir]);

  // ─── Invalidation helpers ─────────────────────────────────────────────────
  const invalidateDirectory = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["directory", targetUserId || "me", dirId || "root"],
    });
  }, [queryClient, targetUserId, dirId]);

  const invalidateUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  }, [queryClient]);

  // ─── Upload ───────────────────────────────────────────────────────────────
  const {
    uploadingFile,
    uploadError,
    isUploading,
    progress,
    handleFileSelect,
    cancelUpload,
  } = useUpload(
    dirId,
    () => {
      invalidateDirectory();
      invalidateUser();
    },
    targetUserId
  );

  // ─── Combined item list ───────────────────────────────────────────────────
  const combinedItems = useMemo(
    () => [
      ...(uploadingFile ? [uploadingFile] : []),
      ...(directoryData
        ? [
            ...directoryData.directories.map((d) => ({
              ...d,
              isDirectory: true,
            })),
            ...directoryData.files.map((f) => ({ ...f, isDirectory: false })),
          ].reverse()
        : []),
    ],
    [uploadingFile, directoryData]
  );

  // ─── Mutations ────────────────────────────────────────────────────────────
  const createDirMutation = useMutation({
    mutationFn: (dirname) => createDirectory(dirId, dirname, targetUserId),
    onSuccess: () => {
      invalidateDirectory();
      invalidateUser();
      closeCreateDir();
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ type, id, name }) =>
      type === "file"
        ? renameFile(id, name, targetUserId)
        : renameDirectory(id, name, targetUserId),
    onSuccess: () => {
      invalidateDirectory();
      invalidateUser();
      closeRename();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) =>
      type === "file"
        ? deleteFile(id, targetUserId)
        : deleteDirectory(id, targetUserId),
    onSuccess: () => {
      invalidateDirectory();
      invalidateUser();
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ dirs, files }) => bulkDeleteItems(dirs, files),
    onSuccess: () => {
      invalidateDirectory();
      invalidateUser();
      clearSelection();
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleOpenItem = useCallback(
    (type, id) => {
      if (type === "directory")
        navigate(
          targetUserId
            ? `/app/admin/users/${targetUserId}/directory/${id}`
            : `/app/directory/${id}`
        );
      else window.location.href = getFileUrl(id, targetUserId);
    },
    [navigate, targetUserId]
  );

  const handleDeleteItem = useCallback(
    (type, id, name) => {
      confirmDialog({
        title: `Delete ${type === "file" ? "File" : "Directory"}`,
        message: `Are you sure you want to delete ${name}?`,
        confirmText: "Delete",
        isDestructive: true,
        onConfirm: () => deleteMutation.mutate({ type, id })
      });
    },
    [deleteMutation]
  );

  const handleBulkDelete = useCallback(() => {
    if (selection.dirs.length + selection.files.length === 0) return;
    const count = selection.dirs.length + selection.files.length;
    confirmDialog({
      title: "Delete Multiple Items",
      message: `Are you sure you want to delete ${count} selected items?`,
      confirmText: "Delete All",
      isDestructive: true,
      onConfirm: () => {
        bulkDeleteMutation.mutate({
          dirs: selection.dirs,
          files: selection.files,
        });
      }
    });
  }, [selection, bulkDeleteMutation]);

  const handleCreateDirectory = useCallback(
    (e) => {
      e.preventDefault();
      createDirMutation.mutate(sanitizeText(modalData.name || "New Folder"));
    },
    [createDirMutation, modalData.name]
  );

  const handleRenameSubmit = useCallback(
    (e) => {
      e.preventDefault();
      renameMutation.mutate({
        type: modalData.type,
        id: modalData.id,
        name: sanitizeText(modalData.name),
      });
    },
    [renameMutation, modalData]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        toggleSelectAll(combinedItems);
      }
      if (e.key === "Escape") {
        clearSelection();
        closeContextMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSelectAll, clearSelection, closeContextMenu, combinedItems]);

  // Click on empty area deselects
  const handleContainerClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        clearSelection();
        closeContextMenu();
      }
    },
    [clearSelection, closeContextMenu]
  );

  // ─── Derived display values ────────────────────────────────────────────────
  const errorMessage =
    uploadError ||
    queryError?.message ||
    createDirMutation.error?.message ||
    renameMutation.error?.message ||
    deleteMutation.error?.message ||
    bulkDeleteMutation.error?.message;

  const isRoot = directoryData && !directoryData.parentDir;
  const defaultDriveName = targetUserId ? "User's Drive" : "My Drive";
  const directoryName =
    !dirId || isRoot ? defaultDriveName : directoryData?.name;
  const directoryPath =
    dirId && directoryData?.path ? directoryData.path : [];

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto"
      onClick={handleContainerClick}
    >
      {/* Hidden file input — lives here so fileInputRef is stable */}
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Emits breadcrumb + action button events to AppShell top bar */}
      <DrivePageHeader
        directoryName={directoryName}
        directoryPath={directoryPath}
        onCreateFolderClick={
          !isReadOnlyAdmin
            ? () => useDriveStore.getState().openCreateDir()
            : undefined
        }
        onUploadFilesClick={
          !isReadOnlyAdmin ? () => fileInputRef.current?.click() : undefined
        }
        disabled={dirNotFound || isReadOnlyAdmin}
        targetUserId={targetUserId}
      />

      {/* Error banner */}
      {errorMessage && !dirNotFound && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      {/* File list area */}
      <div className="px-4 sm:px-6 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3">
            <div className="w-10 h-10 rounded-full border-[3px] border-blue-200 border-t-blue-600 animate-spin" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
          </div>
        ) : combinedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 gap-3 select-none">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl">
              {dirNotFound ? "🔍" : "📂"}
            </div>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">
              {dirNotFound
                ? "Directory not found or you do not have access."
                : "This folder is empty."}
            </p>
            {!dirNotFound && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Upload files or create a folder to get started.
              </p>
            )}
          </div>
        ) : (
          <DirectoryList
            items={combinedItems}
            onItemDoubleClick={handleOpenItem}
            isUploading={isUploading}
            uploadProgress={progress}
            cancelUpload={cancelUpload}
            handleDeleteFile={
              !isReadOnlyAdmin
                ? (id, name) => handleDeleteItem("file", id, name)
                : undefined
            }
            handleDeleteDirectory={
              !isReadOnlyAdmin
                ? (id, name) => handleDeleteItem("directory", id, name)
                : undefined
            }
            isReadOnlyAdmin={isReadOnlyAdmin}
          />
        )}
      </div>

      <FloatingActionBar
        totalCount={combinedItems.length}
        onDelete={
          !isReadOnlyAdmin && !targetUserId ? handleBulkDelete : undefined
        }
        onSelectAll={() => toggleSelectAll(combinedItems)}
      />

      {/* ─── Modals ─────────────────────────────────────────────────────── */}
      {modals.createDir && (
        <CreateDirectoryModal
          newDirname={modalData.name}
          setNewDirname={(name) => setModalData((prev) => ({ ...prev, name }))}
          onClose={closeCreateDir}
          onCreateDirectory={handleCreateDirectory}
        />
      )}

      {modals.rename && (
        <RenameModal
          renameType={modalData.type}
          renameValue={modalData.name}
          setRenameValue={(name) => setModalData((prev) => ({ ...prev, name }))}
          onClose={closeRename}
          onRenameSubmit={handleRenameSubmit}
        />
      )}

      {modals.share && (
        <ShareModal
          fileId={modalData.id}
          fileName={modalData.name}
          onClose={closeShare}
        />
      )}

      {modals.access && (
        <AccessControlModal
          fileId={modalData.id}
          fileName={modalData.name}
          currentAccess={modalData.data}
          dirId={dirId}
          onClose={closeAccess}
          onAccessChanged={(newAccess) =>
            setModalData((prev) => ({ ...prev, data: newAccess }))
          }
        />
      )}

      {modals.details && modalData.data && (
        <DetailsModal
          item={modalData.data}
          directoryName={dirId ? directoryName : "/"}
          directoryPath={directoryPath}
          onClose={closeDetails}
        />
      )}
    </div>
  );
}

export default DirectoryView;
