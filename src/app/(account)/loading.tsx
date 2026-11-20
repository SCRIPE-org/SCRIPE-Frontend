"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import {
  ProfileRailSidebarSkeleton,
  ProfileTelemetryHudSkeleton,
} from "@modules/profile/core/src/presentation/components/AccountSkeletons";

export default function AccountWorldLoading() {
  const { t } = useI18n();

  return (
    <output
      aria-busy="true"
      aria-label={t("profile.common.loadingRegion")}
      data-testid="account-world-loading-skeleton"
      className="block w-full min-w-0 max-w-7xl mx-auto py-2 sm:py-4 overflow-x-clip"
    >
      <ProfileTelemetryHudSkeleton />
      <div className="flex flex-col lg:flex-row gap-6 items-start min-w-0 w-full">
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 min-w-0">
          <ProfileRailSidebarSkeleton />
        </aside>
        <section className="flex-1 min-w-0 w-full space-y-5">
          <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
            <Skeleton shape="title" className="h-5 w-48" />
            <Skeleton shape="text" className="h-3.5 w-72" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Skeleton shape="block" className="h-16 w-full rounded-xl" />
              <Skeleton shape="block" className="h-16 w-full rounded-xl" />
            </div>
          </Card>
          <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
            <Skeleton shape="title" className="h-5 w-40" />
            <Skeleton shape="block" className="h-24 w-full rounded-xl" />
          </Card>
        </section>
      </div>
    </output>
  );
}
