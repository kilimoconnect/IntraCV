import type { Metadata } from "next";
import ExecutiveLandingClient from "@/components/landing/ExecutiveLandingClient";

export const metadata: Metadata = {
  title: "FuseCV for Executives — Board-Level CV Builder for Leaders",
  description:
    "AI-powered CV platform built for executives, founders, and C-suite leaders. Present your leadership, scale, and strategic impact with authority. Trusted by senior professionals worldwide.",
  alternates: { canonical: "https://fusecv.com/executive" },
  openGraph: {
    title: "FuseCV for Executives — Board-Level CV Builder for Leaders",
    description:
      "AI-powered CV platform built for executives, founders, and C-suite leaders. Present your leadership at the level it deserves.",
    url: "https://fusecv.com/executive",
  },
};

export default function ExecutivePage() {
  return <ExecutiveLandingClient />;
}
