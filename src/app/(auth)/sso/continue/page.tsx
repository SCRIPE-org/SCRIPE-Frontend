import { Metadata } from "next";
import { SsoContinueView } from "@modules/auth/signin/src/presentation/views/SsoContinueView";
import { Suspense } from "react";
import { LoadingSpinner } from "@core/ui/loading-spinner";

export const metadata: Metadata = {
  title: "Continue Sign-In | SCRIPE",
  description: "Completing central SSO sign-in continuation",
};

export default function SsoContinuePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-nx-ground">
          <LoadingSpinner size="md" showText={false} />
        </div>
      }
    >
      <SsoContinueView />
    </Suspense>
  );
}
