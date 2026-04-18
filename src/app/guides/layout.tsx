import Link from "next/link";

const allGuides = [
  { slug: "best-cv-format-uk",            title: "Best CV Format in the UK" },
  { slug: "ats-cv-checker",               title: "ATS CV Checker" },
  { slug: "graduate-cv-no-experience",    title: "Graduate CV With No Experience" },
  { slug: "why-not-getting-interviews",   title: "Why You're Not Getting Interviews" },
  { slug: "software-engineer-cv-example", title: "Software Engineer CV Example" },
  { slug: "career-change-cv-example",     title: "Career Change CV Example" },
  { slug: "executive-cv-example",         title: "Executive CV Example" },
  { slug: "cover-letter-example-uk",      title: "Cover Letter Example UK" },
  { slug: "improve-cv-fast",              title: "How to Improve Your CV Fast" },
  { slug: "resume-summary-examples",      title: "Resume Summary Examples" },
];

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <img src="/fusecv-logo.png" alt="FuseCV" width={96} height={30} className="h-7 w-auto" />
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-4 py-2 text-sm font-semibold text-white"
          >
            Improve My CV Free
          </Link>
        </div>
      </nav>

      {/* Page */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/fusecv-logo.png" alt="FuseCV" width={96} height={30} className="h-7 w-auto mb-3" />
              <p className="text-sm text-slate-500 leading-relaxed">
                AI-powered CV improvement for UK job seekers. Upload your CV, get a stronger version in 60 seconds.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">CV Guides</h3>
              <ul className="space-y-1.5">
                {allGuides.slice(0, 5).map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`} className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">More Guides</h3>
              <ul className="space-y-1.5">
                {allGuides.slice(5).map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`} className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} FuseCV. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
              <Link href="/guides" className="hover:text-slate-600">All Guides</Link>
              <Link href="/landing" className="hover:text-slate-600">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
