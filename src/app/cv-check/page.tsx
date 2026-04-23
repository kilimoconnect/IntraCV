import type { Metadata } from "next";
import CVCheckClient from "@/components/cv-check/CVCheckClient";

export const metadata: Metadata = {
  title: "Free CV Check — Get Your Score in 60 Seconds | FuseCV",
  description:
    "Upload your CV and get a free instant analysis. See your ATS score, impact rating, keyword gaps, and exactly what to fix. No account required.",
  alternates: { canonical: "https://fusecv.com/cv-check" },
  openGraph: {
    title: "Free CV Check — Get Your Score in 60 Seconds | FuseCV",
    description:
      "Upload your CV and get a free instant analysis. No account required.",
    url: "https://fusecv.com/cv-check",
  },
};

export default function CVCheckPage() {
  return <CVCheckClient />;
}
