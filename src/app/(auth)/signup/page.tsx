import { Metadata } from "next";
import { Suspense } from "react";
import { SignupWizard } from "@modules/auth/signup/src/presentation/views/SignupWizard";

export const metadata: Metadata = {
  title: "Create a Workspace — Scripe",
  description:
    "Sign up for Scripe and create your team workspace in under 2 minutes. Start free, or try any paid plan with a free trial.",
};

export default function SignupPage() {
  // useSearchParams in the wizard (checkout-canceled return) requires a Suspense boundary
  return (
    <Suspense>
      <SignupWizard />
    </Suspense>
  );
}
