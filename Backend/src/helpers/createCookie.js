export default function createCookie(res, sessionId) {
  const expiryAgeInSec = Number(process.env.COOKIE_EXPIRY || 86400);

  // const domain = process.env.SITE_DOMAIN || ".local.com";
  res.cookie("authToken", sessionId, {
    httpOnly: true,
    signed: true,
    sameSite: "none",
    maxAge: expiryAgeInSec * 1000,
    secure: process.env.NODE_ENV !== 'DEVELOPMENT',
  });
  console.log("cookie assigned to user:");
}
