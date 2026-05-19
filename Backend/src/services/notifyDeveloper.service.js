import sendEmail from "./email.service.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default async function notifyDeveloper(error, context = {}) {
  const developerEmail = process.env.DEVELOPER_EMAIL;
  if (!error) return console.log("no deployment error received!");
  if (!developerEmail) return console.log("no developer email exists!");

  const normalizedError =
    error instanceof Error ? error : new Error(String(error));
  const {
    deliveryId = "unknown",
    eventType = "unknown",
    branch = "unknown",
    shouldInstall = "unknown",
    stderr = "",
  } = context;

  const stackTail = normalizedError.stack
    ? normalizedError.stack.split("\n").slice(-8).join("\n")
    : "no error stack available.";
  const stderrTail = stderr
    ? stderr.split("\n").slice(-20).join("\n")
    : "no stderr available.";

  const shortMessage =
    normalizedError.message.length > 80
      ? `${normalizedError.message.slice(0, 77)}...`
      : normalizedError.message;
  const subject = `[Deploy Error] ${shortMessage}`;

  const htmlBody = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background:#f6f8fb; padding:24px; font-family:Arial,Helvetica,sans-serif; color:#111827;">
      <tr>
        <td align="center">
          <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:680px; max-width:100%; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px;">
            <tr>
              <td style="padding:24px 24px 12px 24px;">
                <div style="font-size:20px; font-weight:700; color:#b91c1c; margin-bottom:8px;">Backend deployment failed</div>
                <div style="font-size:14px; line-height:1.6; color:#374151;">
                  A deployment attempt failed and needs attention.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px; line-height:1.7; color:#111827;">
                  <tr><td style="padding:4px 0;"><strong>Error Name:</strong> ${escapeHtml(normalizedError.name)}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Error Message:</strong> ${escapeHtml(normalizedError.message)}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Event Type:</strong> ${escapeHtml(eventType)}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Branch:</strong> ${escapeHtml(branch)}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Should Install:</strong> ${escapeHtml(String(shouldInstall))}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Delivery ID:</strong> ${escapeHtml(deliveryId)}</td></tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 24px 0 24px;">
                <div style="font-size:14px; font-weight:700; margin-bottom:8px; color:#111827;">Stack Tail</div>
                <pre style="margin:0; white-space:pre-wrap; word-break:break-word; font-size:12px; line-height:1.6; color:#111827; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">${escapeHtml(stackTail)}</pre>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px 24px 24px;">
                <div style="font-size:14px; font-weight:700; margin-bottom:8px; color:#111827;">stderr Tail</div>
                <pre style="margin:0; white-space:pre-wrap; word-break:break-word; font-size:12px; line-height:1.6; color:#111827; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">${escapeHtml(stderrTail)}</pre>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  await sendEmail(developerEmail, subject, htmlBody);
}
