import { Link } from "react-router-dom";
import Nav from "../landing/Nav";
import Footer from "../landing/Footer";

const LAST_UPDATED = "July 26, 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <p>
        By creating an account or using Storra, you agree to be bound by these Terms of Service and our{" "}
        <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Privacy Policy
        </Link>
        . If you do not agree, please discontinue using the service.
      </p>
    ),
  },
  {
    id: "description",
    title: "2. Service Overview",
    content: (
      <p>
        Storra provides personal cloud storage with folder organization, sharing controls, and tiered storage plans powered by Cloudflare R2 object storage and Razorpay billing.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "3. Accounts & Registration",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>You must provide accurate information when registering via email OTP or social sign-in.</li>
        <li>You are responsible for maintaining account confidentiality and all activities under your account.</li>
      </ul>
    ),
  },
  {
    id: "plans-billing",
    title: "4. Storage Plans & Billing",
    content: (
      <>
        <p>Storra offers Free (100 MB), Basic (2 TB), Standard (5 TB), and Pro (10 TB) storage plans.</p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li><strong>Quota Enforcement:</strong> Uploads exceeding your plan quota are restricted. Accounts without an active paid plan automatically default to the Free plan (100 MB).</li>
          <li><strong>Billing:</strong> Recurring payments (monthly/yearly) are processed through Razorpay. Failed payments may place accounts into a past-due or grace period state before quota demotion.</li>
          <li><strong>Plan Upgrades &amp; Downgrades:</strong> Plan updates are supported for card payment methods. Downgrading requires your current storage usage to fit within the new plan limit.</li>
          <li><strong>Cancellation:</strong> You can cancel your subscription at any time. Cancellations take effect at period end or immediately based on your selection.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>You may not upload unlawful, malicious, or copyright-infringing content.</li>
        <li>You may not attempt to bypass storage quotas, manipulate direct storage links, or disrupt service security.</li>
        <li>Accounts violating acceptable use policies may be suspended or terminated.</li>
      </ul>
    ),
  },
  {
    id: "liability",
    title: "6. Service Availability & Liability",
    content: (
      <p>
        Storra is provided on an "as is" basis. While we strive for high availability using Cloudflare R2 infrastructure, we are not liable for indirect damages, service interruptions, or downtime caused by third-party providers beyond our control.
      </p>
    ),
  },
  {
    id: "contact",
    title: "7. Contact Us",
    content: (
      <p>
        For questions regarding these Terms, contact us at{" "}
        <a href="mailto:support@mail.raquibreyaz.in" className="text-blue-600 dark:text-blue-400 hover:underline">
          support@mail.raquibreyaz.in
        </a>.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white antialiased transition-colors">
      <Nav />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
              📜
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Last updated: {LAST_UPDATED}
            </p>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-xl p-4 mb-10 text-sm text-violet-800 dark:text-violet-300 transition-colors">
            Please review these terms before using Storra. By accessing or using our service, you agree to be bound by these terms.
          </div>

          {/* Table of Contents */}
          <nav className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-10 transition-colors">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Contents</h2>
            <ul className="space-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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
              to="/privacy"
              className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              ← Privacy Policy
            </Link>
            <Link
              to="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Back to Home →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
