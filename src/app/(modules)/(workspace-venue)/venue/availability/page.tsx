"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@core/ui/loading-spinner";

function AvailabilityRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resourceId = searchParams?.get("resourceId") || searchParams?.get("id");
    if (resourceId) {
      router.replace(`/venue/resources/${encodeURIComponent(resourceId)}?tab=workingHours`);
    } else {
      const qs = searchParams?.toString();
      const destination = qs ? `/venue/calendar?${qs}` : "/venue/calendar";
      router.replace(destination);
    }
  }, [router, searchParams]);

  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner showText={false} />
    </div>
  );
}

export default function AvailabilityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner showText={false} />
        </div>
      }
    >
      <AvailabilityRedirect />
    </Suspense>
  );
}
