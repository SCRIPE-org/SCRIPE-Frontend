"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

export default function HubLoading() {
  const { t } = useI18n();

  return (
    <output
      aria-busy="true"
      aria-label={t("common.loading")}
      data-testid="hub-loading-skeleton"
      className="block min-h-[100dvh] w-full bg-nx-ground px-4 py-8 sm:px-8"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-nx-line pb-4">
          <div className="space-y-2">
            <Skeleton shape="title" className="h-7 w-52" />
            <Skeleton shape="text" className="h-4 w-72" />
          </div>
          <Skeleton shape="control" className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="border border-nx-line bg-nx-surface p-5 space-y-3">
              <Skeleton shape="circle" className="h-10 w-10" />
              <Skeleton shape="title" className="h-5 w-40" />
              <Skeleton shape="text" className="h-3.5 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </output>
  );
}
