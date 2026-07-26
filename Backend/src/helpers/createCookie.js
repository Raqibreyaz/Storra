export default function createCookie(res, sessionId) {
  const expiryAgeInSec = Number(process.env.COOKIE_EXPIRY || 86400);

  const domain = process.env.PARENT_DOMAIN;
  res.cookie("authToken", sessionId, {
    domain,
    httpOnly: true,
    signed: true,
    sameSite: "strict",
    maxAge: expiryAgeInSec * 1000,
    secure: process.env.NODE_ENV !== "DEVELOPMENT",
  });
}
