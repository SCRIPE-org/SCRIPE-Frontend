"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

export default function SovereignAccountSectionLoading() {
  const { t } = useI18n();

  return (
    <output
      aria-busy="true"
      aria-label={t("profile.common.loadingRegion")}
      data-testid="account-section-loading-skeleton"
      className="block space-y-5"
    >
      <div className="space-y-2">
        <Skeleton shape="title" className="h-6 w-56" />
        <Skeleton shape="text" className="h-3.5 w-80" />
      </div>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
        <Skeleton shape="title" className="h-5 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton shape="block" className="h-16 w-full rounded-xl" />
          <Skeleton shape="block" className="h-16 w-full rounded-xl" />
        </div>
      </Card>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-2.5">
        <Skeleton shape="block" className="h-14 w-full rounded-xl" />
        <Skeleton shape="block" className="h-14 w-full rounded-xl" />
      </Card>
    </output>
  );
}
