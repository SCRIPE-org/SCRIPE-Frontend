/**
 * Permission Tree Skeleton Component
 *
 * Loading state skeleton for the permission tree.
 */
import { Skeleton } from "@core/ui/skeleton";

export function PermissionTreeSkeleton() {
      return (
            <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="border rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-5 w-12" />
                              </div>
                        </div>
                  ))}
            </div>
      );
}
