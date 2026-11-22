"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

/** Loading skeleton placeholder for CRM Overview command center. */
export function CrmOverviewSkeleton() {
  return (
    <div className="space-y-6" data-testid="crm-overview-skeleton">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-xl border border-nx-line bg-nx-surface p-4 space-y-3">
            <Skeleton shape="text" className="w-1/2" />
            <Skeleton shape="title" className="w-2/3 h-7" />
            <Skeleton shape="chip" />
          </Card>
        ))}
      </div>
      <Card className="rounded-xl border border-nx-line bg-nx-surface p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </Card>
      <Card className="rounded-xl border border-nx-line bg-nx-surface p-4 space-y-3">
        <Skeleton shape="title" className="w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    </div>
  );
}
