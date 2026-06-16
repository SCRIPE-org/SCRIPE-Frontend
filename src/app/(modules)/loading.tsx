"use client";

import { LoadingSpinner } from "@core/ui/loading-spinner";

export default function ModulesLoading() {
  return (
    <div className="relative min-h-[400px] w-full">
      {/* Centered Branded Spinner Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <LoadingSpinner size="md" showText={true} className="min-h-0" />
      </div>

      {/* Skeleton Background with reduced opacity */}
      <div className="pointer-events-none w-full select-none space-y-6 opacity-35">
        {/* Page Header Skeleton */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-muted/60" />
            <div className="h-4 w-72 rounded bg-muted/40" />
          </div>
          <div className="h-10 w-28 rounded bg-muted/60" />
        </div>

        {/* Grid of Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-4 rounded-xl border border-border/40 bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-muted/60" />
                <div className="h-8 w-8 rounded-full bg-muted/40" />
              </div>
              <div className="space-y-2">
                <div className="h-7 w-20 rounded bg-muted/80" />
                <div className="h-3.5 w-full rounded bg-muted/40" />
              </div>
            </div>
          ))}
        </div>

        {/* Table/List Detail Skeleton */}
        <div className="space-y-4 rounded-xl border border-border/40 bg-card p-6">
          <div className="h-5 w-36 rounded bg-muted/60" style={{ marginBottom: "16px" }} />
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-full rounded bg-muted/30" />
                <div className="h-4 w-24 rounded bg-muted/40" />
                <div className="h-4 w-12 rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
