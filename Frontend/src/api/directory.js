import { apiGet, apiPost, apiPatch, apiDelete, buildUserPath } from "./client.js";

export const getDirectory = (dirId, targetUserId) => apiGet(`/directory/${buildUserPath(targetUserId)}${dirId || ""}`);

export const createDirectory = (parentDirId, dirname, targetUserId) => apiPost(`/directory/${buildUserPath(targetUserId)}${parentDirId ?? ""}`, { dirname });

export const deleteDirectory = (dirId, targetUserId) => apiDelete(`/directory/${buildUserPath(targetUserId)}${dirId}`);

export const renameDirectory = (dirId, newDirname, targetUserId) => apiPatch(`/directory/${buildUserPath(targetUserId)}${dirId}`, { newDirname });

export const getDirectoryCounts = (dirId) => apiGet(`/directory/${dirId}/descendants/count`);
