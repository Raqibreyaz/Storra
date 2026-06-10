import Session from "../models/session.model.js";

/** How long a session lives, in seconds (24 hours). */
export const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 86400);

/** Max concurrent sessions per user before the oldest is evicted. */
const MAX_SESSIONS_PER_USER = 2;

/** Returns a Date object representing the session expiry from now. */
export function getSessionExpiry() {
  return new Date((Date.now() / 1000 + SESSION_TTL_SECONDS) * 1000);
}

/**
 * Create a new session for `userId`, evicting the oldest session first if the
 * user has already reached the concurrent-session limit.
 *
 * @param {string|ObjectId} userId
 * @param {import("mongoose").ClientSession} [mongoSession]  – pass when inside a transaction
 * @returns {Promise<string>} The new session ID.
 */
export async function createSessionWithLimit(userId, mongoSession) {
  const opts = mongoSession ? { session: mongoSession } : {};

  // Evict the oldest session when the limit is reached
  const noOfSessions = await Session.countDocuments({ user: userId }, opts);
  if (noOfSessions >= MAX_SESSIONS_PER_USER) {
    await Session.findOneAndDelete(
      { user: userId },
      { sort: { expiresAt: 1 }, ...opts },
    );
  }

  // Create the new session
  const userSession = await Session.insertOne(
    { user: userId, expiresAt: getSessionExpiry() },
    opts,
  );

  return userSession.id;
}
