export default function Footer() {
  return (
    <>
      {/* Final CTA */}
      <section className="bg-gray-900/60 border-t border-white/5 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Ready to stop fighting your storage limits?
          </h2>
          <p className="text-gray-400 text-lg">
            Get started in seconds — no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-all duration-150 shadow-lg shadow-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Start for free
            </a>
            <a
              href="/app"
              className="text-gray-300 hover:text-white border border-white/10 hover:border-white/20 px-7 py-3 rounded-xl transition-all duration-150 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Open app
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-lg font-bold text-white tracking-tight">
              Stor<span className="text-blue-400">ra</span>
            </span>

            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
                {[
                  { label: "Docs", href: "#" },
                  { label: "GitHub", href: "#" },
                  { label: "Privacy", href: "#" },
                  { label: "Terms", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <p className="mt-6 text-center text-xs text-gray-600">
            Built with Node.js, React, AWS S3, and Razorpay.
          </p>
        </div>
      </footer>
    </>
  );
}
