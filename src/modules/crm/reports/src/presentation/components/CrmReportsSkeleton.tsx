"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

/**
 * Loading skeleton placeholder for the CRM Commercial Reports view.
 */
export function CrmReportsSkeleton() {
  return (
    <div className="space-y-4" data-testid="crm-reports-skeleton">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <Card key={idx} className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7 rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </Card>
        <Card className="lg:col-span-5 rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    </div>
  );
}
