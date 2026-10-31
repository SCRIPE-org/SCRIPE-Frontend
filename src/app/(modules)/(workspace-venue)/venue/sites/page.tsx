"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@core/ui/loading-spinner";

function SitesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("tab", "sites");
    router.replace(`/venue/facilities?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner showText={false} />
    </div>
  );
}

export default function SitesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner showText={false} />
        </div>
      }
    >
      <SitesRedirect />
    </Suspense>
  );
}
