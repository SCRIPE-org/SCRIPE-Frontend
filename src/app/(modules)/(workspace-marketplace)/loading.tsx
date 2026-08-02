"use client";

import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Route-level loading fallback for the workspace-marketplace group — a
 * listing of app/plugin tiles, so the placeholder is a page header over a
 * card grid rather than table rows. Static fill steps only; absence of data
 * does not pulse.
 */
export default function WorkspaceMarketplaceLoading() {
  const { t } = useI18n();

  return (
    <div
      className="flex flex-col gap-6 p-6"
      role="status"
      aria-busy="true"
      aria-label={t("common.loading")}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-12 w-12" />
          <div className="flex flex-col gap-2">
            <Skeleton shape="title" className="h-6 w-48" />
            <Skeleton shape="text" className="w-72" />
          </div>
        </div>
        <Skeleton shape="control" className="w-28" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-5"
          >
            <Skeleton shape="circle" className="h-10 w-10" />
            <Skeleton shape="title" className="h-5 w-32" />
            <Skeleton shape="text" lines={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
