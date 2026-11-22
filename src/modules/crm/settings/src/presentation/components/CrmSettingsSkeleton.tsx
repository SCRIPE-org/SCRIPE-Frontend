"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

/**
 * Loading skeleton placeholder rendered while CRM tenant settings hydrate.
 */
export function CrmSettingsSkeleton() {
  return (
    <div className="space-y-4" data-testid="crm-settings-skeleton">
      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-3">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-24 w-full" />
      </Card>
    </div>
  );
}
