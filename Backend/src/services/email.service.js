import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

const resend = new Resend(RESEND_API_KEY);

export default async function sendEmail(email, subject, htmlMessage) {
  const info = await resend.emails.send({
    from: `Storra <no-reply@${SENDER_EMAIL}>`,
    to: [email],
    subject,
    html: htmlMessage,
  });

  console.log(info.data.id);
  return info.messageId;
}
