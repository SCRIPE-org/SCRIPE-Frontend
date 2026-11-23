import { Suspense } from "react";
import { Metadata } from "next";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import SamlAcsCallbackView from "@modules/auth/signin/src/presentation/views/SamlAcsCallbackView";

export const metadata: Metadata = {
  title: "SAML Redirecting | SCRIPE",
  description: "Processing your SAML Sign-in...",
};

export default function SamlCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-nx-ground">
          <LoadingSpinner size="md" showText={false} />
        </div>
      }
    >
      <SamlAcsCallbackView />
    </Suspense>
  );
}
