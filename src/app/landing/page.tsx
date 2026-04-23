import type { Metadata } from "next";
import LandingClient from "@/components/landing/LandingClient";

export const metadata: Metadata = {
  title: "FuseCV — Check Your CV Free in 60 Seconds",
  description:
    "Your CV might be why you're not getting interviews. Check it free in 60 seconds. Get instant ATS + recruiter feedback. No payment required.",
  alternates: { canonical: "https://fusecv.com/landing" },
  openGraph: {
    title: "FuseCV — Check Your CV Free in 60 Seconds",
    description:
      "Your CV might be why you're not getting interviews. Check it free in 60 seconds.",
    url: "https://fusecv.com/landing",
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
