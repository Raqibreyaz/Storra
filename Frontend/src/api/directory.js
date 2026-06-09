import { apiGet, apiPost, apiPatch, apiDelete } from "./client.js";

export const getDirectory = (dirId, targetUserId) => apiGet(`/directory/${targetUserId ? targetUserId + '/' : ''}${dirId || ""}`);

export const createDirectory = (parentDirId, dirname, targetUserId) => apiPost(`/directory/${targetUserId ? targetUserId + '/' : ''}${parentDirId ?? ""}`, { dirname });

export const deleteDirectory = (dirId, targetUserId) => apiDelete(`/directory/${targetUserId ? targetUserId + '/' : ''}${dirId}`);

export const renameDirectory = (dirId, newDirname, targetUserId) => apiPatch(`/directory/${targetUserId ? targetUserId + '/' : ''}${dirId}`, { newDirname });

export const getDirectoryCounts = (dirId) => apiGet(`/directory/${dirId}/descendants/count`);
