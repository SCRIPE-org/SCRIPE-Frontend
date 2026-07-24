"use client";

import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

/**
 * Presentation UI component rendering the payouts loading skeleton.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PayoutsLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton shape="title" className="h-9 w-56" />
        <Skeleton shape="text" className="w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="mb-3 h-5 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-nx-lg" />
    </div>
  );
}
