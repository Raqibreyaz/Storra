import { Link } from "react-router-dom";
import Nav from "../landing/Nav";
import Footer from "../landing/Footer";

const LAST_UPDATED = "July 26, 2026";

const sections = [
  {
    id: "data-we-collect",
    title: "1. Data We Collect",
    content: (
      <>
        <p>When you use Storra, we collect essential information required to provide cloud storage and subscription services:</p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li><strong>Account Details:</strong> Your name, email address, and hashed password during sign-up, or profile details provided via Google or GitHub sign-in.</li>
          <li><strong>File Information:</strong> Uploaded files and associated metadata (file names, sizes, content types, and folder structures).</li>
          <li><strong>Billing Details:</strong> Subscription plan, billing cycle dates, and payment status handled via Razorpay. Financial details like credit card or bank numbers are handled directly by Razorpay and never stored on our servers.</li>
          <li><strong>Usage Metrics:</strong> Storage consumption data used to enforce account storage limits.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Data",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Storage &amp; Delivery:</strong> Files are stored securely in Cloudflare R2 and transferred directly between your browser and storage using presigned URLs.</li>
        <li><strong>Subscription Management:</strong> Processing payments, renewing plans, and synchronizing storage quotas through Razorpay.</li>
        <li><strong>Service Communications:</strong> Sending authentication OTPs and subscription status alerts via Resend.</li>
        <li><strong>Access Control:</strong> Enforcing sharing permissions and folder access rules configured by you.</li>
      </ul>
    ),
  },
  {
    id: "data-security",
    title: "3. Data Security",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Encryption:</strong> All data transfers use HTTPS/TLS. Direct storage links use short-lived presigned URLs.</li>
        <li><strong>Session Protection:</strong> Strict session cookies and custom origin checks protect your account from unauthorized access.</li>
        <li><strong>Account Safeguards:</strong> Passwords are securely hashed, and verification OTPs are single-use and time-limited.</li>
      </ul>
    ),
  },
  {
    id: "third-party",
    title: "4. Third-Party Services",
    content: (
      <>
        <p>Storra relies on trusted third-party providers for core infrastructure:</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-900 dark:text-white">Service</th>
                <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-400">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">Cloudflare R2</td>
                <td className="py-2">Cloud object storage &amp; file delivery</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">Razorpay</td>
                <td className="py-2">Payment &amp; subscription processing</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">Resend</td>
                <td className="py-2">Transactional emails &amp; OTP verification</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Google / GitHub OAuth</td>
                <td className="py-2">Authentication &amp; sign-in</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "5. Data Retention & Deletion",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>File Deletion:</strong> Deleting files or folders removes them permanently from your account and storage.</li>
        <li><strong>Account Deletion:</strong> Requesting account termination permanently removes all your files, metadata, and subscriptions.</li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies & Sessions",
    content: (
      <p>
        Storra uses strict authentication cookies solely to keep you signed in securely. We do not use tracking or advertising cookies.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: (
      <p>
        You can access, download, or delete your data at any time via the app. For data requests or account termination, contact us at{" "}
        <a href="mailto:support@mail.raquibreyaz.in" className="text-blue-600 dark:text-blue-400 hover:underline">
          support@mail.raquibreyaz.in
        </a>.
      </p>
    ),
  },
  {
    id: "contact",
    title: "8. Contact Us",
    content: (
      <p>
        If you have questions about this policy, reach out to us at{" "}
        <a href="mailto:support@mail.raquibreyaz.in" className="text-blue-600 dark:text-blue-400 hover:underline">
          support@mail.raquibreyaz.in
        </a>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white antialiased transition-colors">
      <Nav />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
              🔒
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Last updated: {LAST_UPDATED}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 mb-10 text-sm text-blue-800 dark:text-blue-300 transition-colors">
            Your privacy matters to us. This policy clearly outlines what data Storra collects, how it is used, and how your files are stored securely in Cloudflare R2.
          </div>

          {/* Table of Contents */}
          <nav className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-10 transition-colors">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Contents</h2>
            <ul className="space-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* Sections */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10">
            {sections.map((s) => (
              <article key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">
                  {s.title}
                </h2>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors text-[0.938rem]">
                  {s.content}
                </div>
              </article>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
            <Link
              to="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              to="/terms"
              className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Terms of Service →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
