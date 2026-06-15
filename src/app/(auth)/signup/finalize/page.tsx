import { Metadata } from "next";
import { Suspense } from "react";
// The route renders the Elevate finalize screen (reuses useFinalizeViewModel
// verbatim). The legacy SignupFinalizeView was removed in the G1 cleanup pass.
import { SignupFinalizeScreen } from "@modules/auth/signup/src/presentation/views/SignupFinalizeScreen";

export const metadata: Metadata = {
  title: "Finishing your signup — Scripe",
  description: "Confirming your payment and preparing your workspace.",
  robots: { index: false, follow: false },
};

export default function SignupFinalizePage() {
  // useSearchParams in the view requires a Suspense boundary at the route level
  return (
    <Suspense>
      <SignupFinalizeScreen />
    </Suspense>
  );
}
