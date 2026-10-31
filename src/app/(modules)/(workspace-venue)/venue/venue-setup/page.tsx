"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@core/ui/loading-spinner";

function VenueSetupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("tab", "profile");
    router.replace(`/venue/settings?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner showText={false} />
    </div>
  );
}

export default function VenueSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner showText={false} />
        </div>
      }
    >
      <VenueSetupRedirect />
    </Suspense>
  );
}
