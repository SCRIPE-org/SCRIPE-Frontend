"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

/** Loading skeleton placeholder for the CRM sales activity timeline list. */
export function ActivityTimelineSkeleton({ rows = 3 }: { readonly rows?: number }) {
  return (
    <div className="space-y-2.5 py-2" data-testid="activity-timeline-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="p-3.5 border-nx-line bg-nx-surface space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
            </div>
            <Skeleton className="h-3.5 w-20 rounded" />
          </div>
          <Skeleton className="h-3.5 w-3/4 rounded" />
        </Card>
      ))}
    </div>
  );
}
