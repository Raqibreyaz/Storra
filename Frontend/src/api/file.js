import {
  apiDelete,
  apiPatch,
  BASE_URL,
  client,
  ApiError,
  buildUserPath,
} from "./client.js";

export const deleteFile = (fileId, targetUserId) => apiDelete(`/file/${buildUserPath(targetUserId)}${fileId}`);

export const renameFile = (fileId, newFilename, targetUserId) =>
  apiPatch(`/file/rename/${buildUserPath(targetUserId)}${fileId}`, { newFilename });

export const setFileAccess = (fileId, permission, targetUserId) =>
  apiPatch(`/file/set-access/${buildUserPath(targetUserId)}${fileId}`, { permission });

export function getFileUrl(fileId, targetUserId) {
  return `${BASE_URL}/file/${buildUserPath(targetUserId)}${fileId}`;
}

/**
 * Two-step presigned upload flow:
 *  1. POST /file/initiate/:parentDirId  →  { fileId, signedUrl }
 *  2. PUT file to signedUrl (direct to S3)
 *  3. POST /file/complete/:fileId
 *
 * @param {string|null} dirId  - parent directory ID (null/undefined for root)
 * @param {File}        file   - the File object to upload
 * @param {object}      opts
 * @param {function}    opts.onProgress - called with percentage (0-100)
 * @param {function}    opts.onLoad     - called when upload completes successfully
 * @param {function}    opts.onError    - called with error message string on failure
 * @returns {{ abort: Function }}
 */
export function uploadFile(dirId, file, { onProgress, onLoad, onError, targetUserId } = {}) {
  const controller = new AbortController();

  (async () => {
    try {
      // Step 1: Initiate — get presigned URL from backend
      const { fileId, signedUrl } = await client.post(
        `/file/initiate/${buildUserPath(targetUserId)}${dirId ?? ""}`,
        { fileName: file.name, fileSize: file.size, fileType: file.type },
        { signal: controller.signal },
      );

      // Step 2: Upload directly to S3 via presigned URL
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      const informUploadInterrupt = async () => {
        await client.delete(`/file/cancel/${fileId}`);
      };

      // Wire up abort
      const onAbort = () => {
        xhr.abort();
      };

      controller.signal.addEventListener("abort", onAbort);

      await new Promise((resolve, reject) => {
        xhr.upload.onprogress = (evt) => {
          if (onProgress && evt.lengthComputable) {
            onProgress((evt.loaded / evt.total) * 100);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 upload failed (${xhr.status})`));
        };
        xhr.onerror = async () => {
          await informUploadInterrupt();
          reject(new Error("Network error during upload"));
        };
        xhr.onabort = async () => {
          await informUploadInterrupt();
          reject(new DOMException("Upload cancelled", "AbortError"));
        };
        xhr.send(file);
      });

      controller.signal.removeEventListener("abort", onAbort);

      // Step 3: Confirm upload with backend
      await client.post(
        `/file/complete/${buildUserPath(targetUserId)}${fileId}`,
        {},
        {
          signal: controller.signal,
        },
      );

      if (onLoad) onLoad();
    } catch (err) {
      // Cancelled by user — not an error
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") return;

      const errMsg =
        err instanceof ApiError ? err.message : err.message || "Upload failed";
      if (onError) onError(errMsg);
    }
  })();

  return { abort: () => controller.abort() };
}
