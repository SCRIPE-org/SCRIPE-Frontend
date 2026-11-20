"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

/** Loading skeleton placeholder for the CRM Pipeline Workflow Studio directory. */
export function PipelineStudioSkeleton() {
  return (
    <div className="space-y-4" data-testid="pipeline-studio-skeleton">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-64 rounded" />
          <Skeleton className="h-3.5 w-96 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 border-nx-line bg-nx-surface space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-7 w-28 rounded" />
              <Skeleton className="h-7 w-24 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
