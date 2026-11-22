"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";

/** Route-level loading fallback for CRM Overview workspace root. */
export default function WorkspaceCrmLoading() {
  const { t } = useI18n();

  return (
    <div
      className="flex flex-col gap-6 p-6 max-w-7xl mx-auto"
      role="status"
      aria-busy="true"
      aria-label={t("common.loading", { defaultValue: "Loading..." })}
    >
      <div className="flex items-center justify-between gap-4 border-b border-nx-line pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton shape="title" className="h-7 w-48" />
          <Skeleton shape="text" className="w-80" />
        </div>
        <Skeleton shape="control" className="w-28 h-8" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="flex flex-col gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-5"
          >
            <Skeleton shape="title" className="h-4 w-28" />
            <Skeleton shape="title" className="h-8 w-36" />
            <Skeleton shape="text" className="w-32" />
          </Card>
        ))}
      </div>

      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5">
        <Skeleton shape="title" className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-nx-md" />
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-2 rounded-nx-lg border border-nx-line bg-nx-surface p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-nx-md" />
        ))}
      </Card>
    </div>
  );
}
