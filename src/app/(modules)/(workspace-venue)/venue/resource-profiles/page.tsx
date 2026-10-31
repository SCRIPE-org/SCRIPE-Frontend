"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@core/ui/loading-spinner";

function ResourceProfilesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resourceId = searchParams?.get("resourceId") || searchParams?.get("id");
    const qs = searchParams?.toString();
    const destination = resourceId
      ? `/venue/resources/${encodeURIComponent(resourceId)}`
      : qs
        ? `/venue/resources?${qs}`
        : "/venue/resources";
    router.replace(destination);
  }, [router, searchParams]);

  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner showText={false} />
    </div>
  );
}

export default function ResourceProfilesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner showText={false} />
        </div>
      }
    >
      <ResourceProfilesRedirect />
    </Suspense>
  );
}
