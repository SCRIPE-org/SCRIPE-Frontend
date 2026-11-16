"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

export default function StudioLoading() {
  const { t } = useI18n();

  return (
    <output
      aria-busy="true"
      aria-label={t("common.loading")}
      data-testid="studio-loading-skeleton"
      className="flex min-h-[100dvh] w-full flex-col bg-nx-ground"
    >
      <div className="h-14 border-b border-nx-line bg-nx-surface px-4 flex items-center justify-between">
        <Skeleton shape="title" className="h-5 w-44" />
        <div className="flex items-center gap-2">
          <Skeleton shape="control" className="h-8 w-24" />
          <Skeleton shape="control" className="h-8 w-24" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        <Card className="lg:col-span-3 border border-nx-line bg-nx-surface p-4 space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} shape="control" className="h-10 w-full" />
          ))}
        </Card>
        <Card className="lg:col-span-9 border border-nx-line bg-nx-surface p-6 space-y-4">
          <Skeleton shape="title" className="h-6 w-56" />
          <Skeleton shape="block" className="h-64 w-full rounded-xl" />
        </Card>
      </div>
    </output>
  );
}
