import { getFileUrl } from "../api/file";
import useDriveStore from "../store/driveStore";

function ContextMenu({
  item,
  contextMenuPos,
  isUploadingItem,
  cancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  isReadOnlyAdmin,
}) {
  const closeContextMenu = useDriveStore((s) => s.closeContextMenu);
  const openRename = useDriveStore((s) => s.openRename);
  const openShare = useDriveStore((s) => s.openShare);
  const openAccess = useDriveStore((s) => s.openAccess);
  const openDetails = useDriveStore((s) => s.openDetails);

  const withClose = (fn) =>
    (...args) => {
      closeContextMenu();
      fn(...args);
    };

  const menuCls =
    "fixed bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-[999] py-1.5 min-w-[175px] overflow-hidden transition-colors";
  const itemCls =
    "flex items-center gap-2.5 px-4 py-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-100 transition-colors";
  const dangerCls =
    "flex items-center gap-2.5 px-4 py-2 cursor-pointer text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors";
  const dividerCls = "border-t border-gray-100 dark:border-gray-700 my-1";

  const renderContent = () => {
    if (isUploadingItem && item.isUploading) {
      return (
        <div className={dangerCls} onClick={withClose(cancelUpload)}>
          Cancel Upload
        </div>
      );
    }

    if (item.isDirectory) {
      return (
        <>
          {!isReadOnlyAdmin && (
            <div
              className={itemCls}
              onClick={withClose(() =>
                openRename("directory", item._id, item.name)
              )}
            >
              ✏️ Rename
            </div>
          )}
          <div
            className={itemCls}
            onClick={withClose(() => openDetails(item))}
          >
            ℹ️ Details
          </div>
          {!isReadOnlyAdmin && (
            <>
              <div className={dividerCls} />
              <div
                className={dangerCls}
                onClick={withClose(() =>
                  handleDeleteDirectory(item._id, item.name)
                )}
              >
                🗑️ Delete
              </div>
            </>
          )}
        </>
      );
    }

    // File
    return (
      <>
        <div
          className={itemCls}
          onClick={withClose(() =>
            window.open(
              `${getFileUrl(item._id)}?action=download`,
              "_blank"
            )
          )}
        >
          ⬇️ Download
        </div>
        {!isReadOnlyAdmin && (
          <>
            <div
              className={itemCls}
              onClick={withClose(() =>
                openRename("file", item._id, item.name)
              )}
            >
              ✏️ Rename
            </div>
            <div
              className={itemCls}
              onClick={withClose(() => openShare(item._id, item.name))}
            >
              🔗 Share
            </div>
            <div
              className={itemCls}
              onClick={withClose(() =>
                openAccess(item._id, item.name, item.allowAnyoneAccess)
              )}
            >
              🔒 Manage Access
            </div>
          </>
        )}
        <div
          className={itemCls}
          onClick={withClose(() => openDetails(item))}
        >
          ℹ️ Details
        </div>
        {!isReadOnlyAdmin && (
          <>
            <div className={dividerCls} />
            <div
              className={dangerCls}
              onClick={withClose(() =>
                handleDeleteFile(item._id, item.name)
              )}
            >
              🗑️ Delete
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div
      className={menuCls}
      style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {renderContent()}
    </div>
  );
}

export default ContextMenu;
