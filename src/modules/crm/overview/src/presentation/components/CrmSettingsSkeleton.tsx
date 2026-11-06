"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

export function CrmSettingsSkeleton() {
  return (
    <div className="space-y-5" data-testid="crm-settings-skeleton">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-5 border-nx-line bg-nx-surface space-y-4">
          <div className="flex items-center justify-between border-b border-nx-line pb-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-64 rounded" />
              <Skeleton className="h-3 w-96 rounded" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}
