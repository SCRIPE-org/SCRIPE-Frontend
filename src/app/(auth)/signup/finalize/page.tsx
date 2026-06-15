import { Metadata } from "next";
import { Suspense } from "react";
// F8–F10: the route now renders the NEW Elevate finalize screen (reuses
// useFinalizeViewModel verbatim). The legacy SignupFinalizeView is kept in the
// tree until the F11 cleanup pass.
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
