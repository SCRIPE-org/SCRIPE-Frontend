/**
 * Permission Tree Skeleton Component
 *
 * Loading placeholder for the permission matrix. Keeps the real frame — module
 * sub-headers and category rows with per-column cells — so nothing shifts when
 * the data lands; only the pulse blocks swap for content.
 */
import { Skeleton } from "@core/ui/skeleton";

export function PermissionTreeSkeleton() {
  return (
    <div className="overflow-hidden rounded-b-nx-lg border-t border-nx-line">
      {[0, 1, 2].map((m) => (
        <section key={m} className="border-b border-nx-line last:border-b-0">
          {/* Module sub-header */}
          <div className="flex h-11 items-center gap-2.5 border-b border-nx-line-hi bg-nx-surface px-4">
            <Skeleton className="h-4 w-4 rounded-nx-sm" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ms-auto h-4 w-10" />
          </div>
          {/* Column header + category rows */}
          <div className="px-4">
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="flex h-9 items-center gap-2.5">
                <Skeleton className="h-4 w-4 rounded-nx-sm" />
                <Skeleton className="h-4 w-40" />
                <div className="ms-auto flex items-center gap-6">
                  {[0, 1, 2, 3].map((c) => (
                    <Skeleton key={c} className="h-4 w-4 rounded-nx-sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
