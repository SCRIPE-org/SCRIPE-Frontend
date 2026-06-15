import { Metadata } from "next";
import { Suspense } from "react";
// Stripe success/cancel callbacks land here (/signup/complete?session_id=...).
// The finalize screen owns all post-payment polling, JWT hydration, and
// dashboard redirect — this route is a clean Stripe-facing URL alias.
import { SignupFinalizeScreen } from "@modules/auth/signup/src/presentation/views/SignupFinalizeScreen";

export const metadata: Metadata = {
  title: "Setting up your workspace — Scripe",
  description: "Confirming your payment and preparing your workspace.",
  robots: { index: false, follow: false },
};

export default function SignupCompletePage() {
  return (
    <Suspense>
      <SignupFinalizeScreen />
    </Suspense>
  );
}
