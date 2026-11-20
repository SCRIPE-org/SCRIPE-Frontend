"use client";

/**
 * AccountSkeletons.Console
 *
 * Loading skeletons for governance, activity, preferences, notifications, plan, and integrations pages.
 */
import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

function useSkeletonRegionLabel() {
  const { t } = useI18n();
  return t("profile.common.loadingRegion");
}

/** Loading placeholder for the Governance & Delegations page. */
export function GovernancePageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="governance-skeleton" className="block space-y-5">
      <div className="space-y-2">
        <Skeleton shape="title" className="h-6 w-60" />
        <Skeleton shape="text" className="h-3.5 w-80" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="border border-nx-line bg-nx-surface p-4 space-y-2">
            <Skeleton shape="text" className="h-3 w-28" />
            <Skeleton shape="title" className="h-6 w-16" />
            <Skeleton shape="text" className="h-3 w-36" />
          </Card>
        ))}
      </div>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
        <Skeleton shape="title" className="h-5 w-48" />
        <Skeleton shape="control" className="h-9 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} shape="block" className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    </output>
  );
}

/** Loading placeholder for the Account Activity forensic console page. */
export function ActivityPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="activity-skeleton" className="block space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton shape="title" className="h-6 w-56" />
          <Skeleton shape="text" className="h-3.5 w-72" />
        </div>
        <Skeleton shape="control" className="h-8 w-32" />
      </div>
      <Card className="border border-nx-line bg-nx-surface p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Skeleton shape="control" className="h-9 w-full" />
          <Skeleton shape="control" className="h-9 w-full" />
          <Skeleton shape="control" className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton shape="text" className="h-4 w-48" />
                <Skeleton shape="text" className="h-3 w-72" />
              </div>
              <Skeleton shape="control" className="h-7 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </output>
  );
}

/** Loading placeholder for the Workstation Preferences & Ergonomics page. */
export function PreferencesPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="preferences-skeleton" className="block space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton shape="title" className="h-6 w-60" />
          <Skeleton shape="text" className="h-3.5 w-80" />
        </div>
        <Skeleton shape="chip" className="h-7 w-24" />
      </div>
      <Card className="border border-nx-line bg-nx-surface p-4 space-y-3">
        <Skeleton shape="title" className="h-5 w-48" />
        <Skeleton shape="block" className="h-28 w-full rounded-xl" />
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface p-4 space-y-3">
          <Skeleton shape="title" className="h-5 w-44" />
          <div className="grid grid-cols-3 gap-2.5">
            <Skeleton shape="block" className="h-16 w-full rounded-lg" />
            <Skeleton shape="block" className="h-16 w-full rounded-lg" />
            <Skeleton shape="block" className="h-16 w-full rounded-lg" />
          </div>
        </Card>
        <Card className="border border-nx-line bg-nx-surface p-4 space-y-3">
          <Skeleton shape="title" className="h-5 w-44" />
          <div className="grid grid-cols-2 gap-2.5">
            <Skeleton shape="control" className="h-10 w-full" />
            <Skeleton shape="control" className="h-10 w-full" />
            <Skeleton shape="control" className="h-10 w-full" />
            <Skeleton shape="control" className="h-10 w-full" />
          </div>
        </Card>
      </div>
    </output>
  );
}

/** Loading placeholder for the Notifications & Alert Routing page. */
export function NotificationsPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="notifications-skeleton" className="block space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton shape="title" className="h-6 w-56" />
          <Skeleton shape="text" className="h-3.5 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton shape="control" className="h-8 w-40" />
          <Skeleton shape="control" className="h-8 w-28" />
        </div>
      </div>
      <Card className="border border-nx-line bg-nx-surface p-4 space-y-2.5">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} shape="block" className="h-16 w-full rounded-xl" />
        ))}
      </Card>
    </output>
  );
}

/** Loading placeholder for the Plan & Entitlements page. */
export function PlanPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="plan-skeleton" className="block space-y-5">
      <div className="space-y-2">
        <Skeleton shape="title" className="h-6 w-60" />
        <Skeleton shape="text" className="h-3.5 w-72" />
      </div>
      <Card className="border border-nx-line bg-nx-surface p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton shape="block" className="h-20 w-full rounded-xl" />
        <Skeleton shape="block" className="h-20 w-full rounded-xl" />
        <Skeleton shape="block" className="h-20 w-full rounded-xl" />
      </Card>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
        <Skeleton shape="title" className="h-5 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} shape="block" className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    </output>
  );
}

/** Loading placeholder for the Integrations & PAT Federation page. */
export function IntegrationsPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="integrations-skeleton" className="block space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton shape="title" className="h-6 w-56" />
          <Skeleton shape="text" className="h-3.5 w-72" />
        </div>
        <Skeleton shape="control" className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="border border-nx-line bg-nx-surface p-4 space-y-2">
            <Skeleton shape="text" className="h-3 w-32" />
            <Skeleton shape="title" className="h-6 w-20" />
          </Card>
        ))}
      </div>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-2.5">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} shape="block" className="h-16 w-full rounded-xl" />
        ))}
      </Card>
    </output>
  );
}

/** Loading placeholder for /account/integrations/new PAT Creation Studio. */
export function PatCreatePageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="pat-create-skeleton" className="block space-y-5">
      <Skeleton shape="text" className="h-4 w-64" />
      <div className="space-y-2">
        <Skeleton shape="title" className="h-6 w-72" />
        <Skeleton shape="text" className="h-3.5 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
            <Skeleton shape="control" className="h-9 w-full" />
            <Skeleton shape="block" className="h-20 w-full rounded-lg" />
          </Card>
          <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
            <Skeleton shape="title" className="h-5 w-48" />
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} shape="block" className="h-14 w-full rounded-xl" />
            ))}
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
            <Skeleton shape="title" className="h-5 w-40" />
            <Skeleton shape="block" className="h-24 w-full rounded-xl" />
            <Skeleton shape="control" className="h-9 w-full" />
          </Card>
        </div>
      </div>
    </output>
  );
}

/** Loading placeholder for /account/integrations/[id] PAT Detail page. */
export function PatDetailPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="pat-detail-skeleton" className="block space-y-5">
      <Skeleton shape="text" className="h-4 w-56" />
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton shape="title" className="h-6 w-64" />
          <Skeleton shape="text" className="h-3.5 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton shape="control" className="h-8 w-28" />
          <Skeleton shape="control" className="h-8 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="border border-nx-line bg-nx-surface p-4 space-y-2">
            <Skeleton shape="text" className="h-3 w-28" />
            <Skeleton shape="title" className="h-5 w-24" />
          </Card>
        ))}
      </div>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} shape="block" className="h-12 w-full rounded-xl" />
        ))}
      </Card>
    </output>
  );
}
