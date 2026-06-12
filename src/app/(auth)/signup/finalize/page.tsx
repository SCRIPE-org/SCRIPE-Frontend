import { Metadata } from "next";
import { Suspense } from "react";
import { SignupFinalizeView } from "@modules/auth/signup/src/presentation/views/SignupFinalizeView";

export const metadata: Metadata = {
  title: "Finishing your signup — Scripe",
  description: "Confirming your payment and preparing your workspace.",
  robots: { index: false, follow: false },
};

export default function SignupFinalizePage() {
  // useSearchParams in the view requires a Suspense boundary at the route level
  return (
    <Suspense>
      <SignupFinalizeView />
    </Suspense>
  );
}
