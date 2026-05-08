import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy – FuseCV",
  description: "How FuseCV collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "7 April 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F8]">

      {/* ── Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image src="/fusecv-logo.png" alt="FuseCV" width={135} height={42} className="object-contain" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#004aad] transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      {/* ── Hero ── */}
      <div className="bg-[#004aad] py-14 px-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/25 mb-4">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto">
          We care about your privacy. This policy explains exactly what we collect, why, and how you stay in control.
        </p>
        <p className="text-indigo-300 text-xs mt-4">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* ── Content ── */}
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">

        <Section title="1. Who We Are">
          <p>
            FuseCV (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is an AI-powered CV and job application tool. Our service is available at{" "}
            <a href="https://fusecv.com" className="text-indigo-600 hover:underline font-medium">fusecv.com</a>.
            If you have any questions about this policy, contact us at{" "}
            <a href="mailto:support@fusecv.com" className="text-indigo-600 hover:underline font-medium">support@fusecv.com</a>.
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <p className="mb-3">We collect only what is necessary to provide the service:</p>
          <ul className="space-y-3">
            <Li title="Account information">Your name and email address when you register.</Li>
            <Li title="CV content">Work history, education, skills, certifications, and any other sections you enter or upload. This data is yours — we store it to generate your CV documents.</Li>
            <Li title="Uploaded documents">PDF or Word files you upload for AI extraction. Files are processed and immediately discarded — we do not store the original files.</Li>
            <Li title="Usage data">Pages visited, features used, and error logs to help us improve the product. This data is anonymised where possible.</Li>
            <Li title="Payment data">If you purchase a CV download or interview prep top-up, payment is processed by Flutterwave. We receive only a transaction status — no card or bank details are stored on our servers.</Li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="space-y-3">
            <Li title="Providing the service">Building, storing, and exporting your CV; generating tailored versions and cover letters; powering interview preparation.</Li>
            <Li title="Account management">Sending confirmation emails, welcome messages, and important service notifications.</Li>
            <Li title="AI processing">Your CV content is sent to our AI provider (Google Gemini / OpenAI) solely to generate or improve your CV. It is not used to train public models.</Li>
            <Li title="Product improvement">Anonymised usage analytics help us fix bugs and improve features.</Li>
            <Li title="Legal obligations">We may process data to comply with applicable law or respond to lawful requests.</Li>
          </ul>
        </Section>


        <Section title="5. Data Retention">
          <ul className="space-y-3">
            <Li title="Active accounts">Your CV data is retained for as long as your account is active.</Li>
            <Li title="Unconfirmed accounts">If you register but do not confirm your email within 7 days, your account and all associated data are automatically deleted.</Li>
            <Li title="Account deletion">When you delete your account via Settings, all personal data — CV content, documents, and personal information — is permanently removed from our systems within 30 days.</Li>
            <Li title="Uploaded files">Original uploaded PDF / Word files are deleted immediately after AI extraction is complete.</Li>
          </ul>
        </Section>

        <Section title="6. Your Rights">
          <p className="mb-3">Depending on your location, you may have the following rights:</p>
          <ul className="space-y-2 list-disc list-inside text-slate-600 leading-relaxed">
            <li><strong className="text-slate-800">Access</strong> — request a copy of your personal data.</li>
            <li><strong className="text-slate-800">Correction</strong> — update inaccurate or incomplete data (directly in your profile settings).</li>
            <li><strong className="text-slate-800">Deletion</strong> — delete your account and all data via Settings → Delete Account.</li>
            <li><strong className="text-slate-800">Portability</strong> — request your CV data in a structured format.</li>
            <li><strong className="text-slate-800">Objection</strong> — object to processing based on legitimate interests.</li>
          </ul>
          <p className="mt-3">
            To exercise any right, email us at{" "}
            <a href="mailto:support@fusecv.com" className="text-indigo-600 hover:underline font-medium">support@fusecv.com</a>.
            We respond within 30 days.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use only essential cookies required for authentication and session management (provided by Supabase). We do not use advertising or tracking cookies.
            You can block cookies in your browser settings, but this may prevent you from signing in.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            All data is encrypted in transit (TLS) and at rest. Access to production systems is restricted to authorised personnel only.
            While we implement industry-standard security measures, no system is 100% secure. If you discover a vulnerability, please report it responsibly to{" "}
            <a href="mailto:support@fusecv.com" className="text-indigo-600 hover:underline font-medium">support@fusecv.com</a>.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            FuseCV is not directed at children under 16. We do not knowingly collect personal data from anyone under 16.
            If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this policy from time to time. When we make material changes, we will notify registered users by email
            and update the &quot;Last updated&quot; date at the top. Continued use of FuseCV after changes take effect constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions or concerns about this policy? Contact us:
          </p>
          <div className="mt-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800 space-y-1">
            <p><strong>FuseCV Privacy Team</strong></p>
            <p>Email: <a href="mailto:support@fusecv.com" className="hover:underline font-medium">support@fusecv.com</a></p>
            <p>Website: <a href="https://fusecv.com" className="hover:underline font-medium">fusecv.com</a></p>
          </div>
        </Section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-400 space-y-1">
        <p>© {new Date().getFullYear()} FuseCV. All rights reserved.</p>
        <p>
          <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
          {" · "}
          <Link href="/unsubscribe" className="hover:text-indigo-600 transition-colors">Unsubscribe</Link>
        </p>
      </footer>

    </div>
  );
}

/* ── Sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 pb-2 border-b border-slate-200">{title}</h2>
      <div className="text-slate-600 leading-relaxed text-sm sm:text-base">{children}</div>
    </section>
  );
}

function Li({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
      <span><strong className="text-slate-800">{title}:</strong> {children}</span>
    </li>
  );
}
