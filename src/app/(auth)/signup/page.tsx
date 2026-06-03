import { Metadata } from "next";
import { SignupView } from "@modules/auth/signup/src/presentation/views/SignupView";

export const metadata: Metadata = {
  title: "Create a Workspace — Scripe",
  description:
    "Sign up for Scripe and create your team workspace in under 2 minutes. Enterprise-grade platform, no credit card required.",
};

export default function SignupPage() {
  return <SignupView />;
}
