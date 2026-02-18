import { Skeleton } from "@core/ui/skeleton";

/**
 * P1.3: Route-level loading skeleton for module pages.
 * Shown automatically by Next.js during route transitions.
 */
export default function ModulesLoading() {
      return (
            <main className="space-y-6 p-6">
                  {/* Page header skeleton */}
                  <div className="flex items-center justify-between">
                        <div className="space-y-2">
                              <Skeleton className="h-8 w-48" />
                              <Skeleton className="h-4 w-72" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                  </div>

                  {/* Stats cards skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-32" />
                              </div>
                        ))}
                  </div>

                  {/* Table skeleton */}
                  <div className="rounded-lg border bg-card">
                        {/* Search bar */}
                        <div className="p-4 border-b">
                              <Skeleton className="h-10 w-full max-w-sm" />
                        </div>
                        {/* Table rows */}
                        <div className="p-4 space-y-3">
                              {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                          <Skeleton className="h-5 w-8" />
                                          <Skeleton className="h-5 w-32" />
                                          <Skeleton className="h-5 w-48 flex-1" />
                                          <Skeleton className="h-5 w-24" />
                                          <Skeleton className="h-5 w-20" />
                                          <Skeleton className="h-8 w-8 rounded-full" />
                                    </div>
                              ))}
                        </div>
                        {/* Pagination */}
                        <div className="p-4 border-t flex justify-between items-center">
                              <Skeleton className="h-4 w-32" />
                              <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                              </div>
                        </div>
                  </div>
            </main>
      );
}
