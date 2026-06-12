/**
 * DrivePageHeader
 *
 * Emits two custom window events that AppShell listens to:
 *   - "drive:breadcrumb"  → populates the top-bar breadcrumb
 *   - "drive:actions"     → populates the New Folder / Upload buttons
 *
 * This avoids any prop-drilling or React context while keeping the layout
 * and the page content in separate component trees.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DrivePageHeader({
  directoryName,
  directoryPath,
  onCreateFolderClick,
  onUploadFilesClick,
  disabled,
  targetUserId,
}) {
  const navigate = useNavigate();

  // Emit breadcrumb info
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("drive:breadcrumb", {
        detail: { navigate, targetUserId, directoryPath, directoryName },
      })
    );
    // Clear on unmount
    return () => {
      window.dispatchEvent(
        new CustomEvent("drive:breadcrumb", { detail: null })
      );
    };
  }, [navigate, targetUserId, directoryPath, directoryName]);

  // Emit action button config
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("drive:actions", {
        detail: { onCreateFolderClick, onUploadFilesClick, disabled },
      })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("drive:actions", { detail: null })
      );
    };
  }, [onCreateFolderClick, onUploadFilesClick, disabled]);

  // Renders nothing — it's a side-effect-only component
  return null;
}
