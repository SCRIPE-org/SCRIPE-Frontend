"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { ActivityTimelineSkeleton } from "@modules/crm";

/** Loading skeleton placeholder for the CRM Contact detail workspace. */
export function ContactDetailSkeleton() {
  return (
    <div className="space-y-6" data-testid="contact-detail-skeleton">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Full-Width Contact Profile Card */}
      <Card className="p-6 border-nx-line bg-nx-surface space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-52 rounded" />
              <Skeleton className="h-3.5 w-36 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-nx-line">
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </Card>

      {/* 1:1 Details / Account Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-nx-line bg-nx-surface space-y-3">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-14 w-full rounded" />
          <Skeleton className="h-14 w-full rounded" />
        </Card>
        <Card className="p-5 border-nx-line bg-nx-surface space-y-3">
          <Skeleton className="h-4 w-44 rounded" />
          <Skeleton className="h-14 w-full rounded" />
          <Skeleton className="h-14 w-full rounded" />
        </Card>
      </div>

      {/* Activity Timeline Section */}
      <Card className="p-5 border-nx-line bg-nx-surface">
        <ActivityTimelineSkeleton />
      </Card>
    </div>
  );
}
