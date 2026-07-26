import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:8080";

/**
 * Lightweight error class carrying the server's errorCode + message.
 * Components can catch this and read err.message / err.errorCode.
 */
export class ApiError extends Error {
  constructor(message, errorCode, status) {
    super(message);
    this.errorCode = errorCode;
    this.status = status;
  }
}

// ─── Axios instance ──────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json", "X-CSRF-Token": "1234" },
});

// ─── Response interceptor ────────────────────────────────────────────────────
client.interceptors.response.use(
  // On success: unwrap to response.data so callers get parsed JSON directly
  (response) => response.data,

  // On error: normalise into an ApiError
  (error) => {
    // Network / timeout errors (no response at all)
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          "Network error — check your connection",
          "NETWORK_ERROR",
          0,
        ),
      );
    }

    const { status, data } = error.response;
    const errorCode = data?.errorCode || "UNKNOWN_ERROR";
    const message = data?.error || `Request failed (${status})`;

    const skipAuthRedirect = error.config?.skipAuthRedirect;

    // Only redirect when the session is missing/expired (authenticate middleware),
    // NOT for other 401s like invalid credentials on login/register pages.
    if (status === 401 && errorCode === "AUTH_REQUIRED" && !skipAuthRedirect) {
      window.location.href = "/login";
      return Promise.reject(new ApiError(message, errorCode, 401));
    }

    return Promise.reject(new ApiError(message, errorCode, status));
  },
);

// ─── Public helpers (return parsed data directly, throw ApiError on failure) ─
export async function apiGet(endpoint, config) {
  return client.get(endpoint, config);
}

export async function apiPost(endpoint, body, config) {
  return client.post(endpoint, body, config);
}

export async function apiPatch(endpoint, body, config) {
  return client.patch(endpoint, body, config);
}

export async function apiPut(endpoint, body, config) {
  return client.put(endpoint, body, config);
}

export async function apiDelete(endpoint, config) {
  return client.delete(endpoint, config);
}

/**
 * Build the optional user-scoped path prefix used by admin file/directory routes.
 *
 * When an admin operates on another user's files the backend expects the
 * targetUserId prepended to the resource path, e.g. `/file/{userId}/{fileId}`.
 * Previously this was inlined as `${targetUserId ? targetUserId + '/' : ''}`
 * in every API function (10 occurrences). A single change here propagates everywhere.
 *
 * @param {string|null|undefined} targetUserId
 * @returns {string}  e.g. "abc123/" or ""
 */
export function buildUserPath(targetUserId) {
  return targetUserId ? `${targetUserId}/` : "";
}

export { BASE_URL, client };
