import type { Metadata } from "next";
import HomepageClient from "@/components/landing/HomepageClient";

export const metadata: Metadata = {
  title: "FuseCV — AI CV Builder | Fix Your CV in 60 Seconds",
  description:
    "Upload your CV and AI rewrites it in 60 seconds — ATS-optimised, professionally formatted, tailored to the job. Used by job seekers in 30+ countries.",
  alternates: { canonical: "https://fusecv.com" },
  openGraph: {
    title: "FuseCV — AI CV Builder | Fix Your CV in 60 Seconds",
    description:
      "Upload your CV and AI rewrites it — ATS-optimised, professionally formatted, ready to send. Used by thousands of job seekers worldwide.",
    url: "https://fusecv.com",
  },
};

export default function HomePage() {
  return <HomepageClient />;
}
