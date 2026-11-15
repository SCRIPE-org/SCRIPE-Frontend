import { Metadata } from "next";
import { SsoCallbackView } from "@modules/auth/signin/src/presentation/views/SsoCallbackView";
import { Suspense } from "react";
import { LoadingSpinner } from "@core/ui/loading-spinner";

export const metadata: Metadata = {
  title: "SSO Login | SCRIPE",
  description: "Processing SSO authentication",
};

export default function SsoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-nx-ground">
          <LoadingSpinner size="md" showText={false} />
        </div>
      }
    >
      <SsoCallbackView />
    </Suspense>
  );
}
