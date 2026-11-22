"use client";

/**
 * AccountSkeletons.Shell
 *
 * Loading skeletons for the telemetry HUD, sidebar rail, dossier, security, and sessions pages.
 */
import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

function useSkeletonRegionLabel() {
  const { t } = useI18n();
  return t("profile.common.loadingRegion");
}

/** Loading placeholder for `ProfileTelemetryHud`. */
export function ProfileTelemetryHudSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output
      aria-busy="true"
      aria-label={label}
      data-testid="telemetry-hud-skeleton"
      className="block rounded-xl border border-nx-line bg-nx-surface p-3 sm:p-4 mb-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-11 w-11 shrink-0" />
          <div className="space-y-2">
            <Skeleton shape="text" className="h-4 w-44" />
            <Skeleton shape="text" className="h-3 w-64" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton shape="chip" className="h-7 w-28" />
          <Skeleton shape="chip" className="h-7 w-32" />
          <Skeleton shape="chip" className="h-7 w-28" />
          <Skeleton shape="control" className="h-8 w-28" />
        </div>
      </div>
    </output>
  );
}

/** Loading placeholder for the left navigation rail in `ProfileRailLayout`. */
export function ProfileRailSidebarSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output
      aria-busy="true"
      aria-label={label}
      data-testid="profile-rail-skeleton"
      className="block rounded-xl border border-nx-line bg-nx-surface p-4 space-y-4"
    >
      <div className="flex items-center gap-3 pb-3 border-b border-nx-line">
        <Skeleton shape="circle" className="h-11 w-11 shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton shape="text" className="h-4 w-32" />
          <Skeleton shape="text" className="h-3 w-40" />
          <Skeleton shape="chip" className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-1.5 pb-3 border-b border-nx-line">
        <Skeleton shape="text" className="h-3 w-28" />
        <Skeleton shape="control" className="h-9 w-full" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton shape="text" className="h-3 w-24" />
            <Skeleton shape="control" className="h-9 w-full" />
          </div>
        ))}
      </div>
    </output>
  );
}

/** Loading placeholder for the Account Dossier page. */
export function DossierPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="dossier-skeleton" className="block space-y-5">
      <Card className="border border-nx-line bg-nx-surface">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton shape="title" className="h-5 w-48" />
            <Skeleton shape="text" className="h-3.5 w-72" />
          </div>
          <Skeleton shape="control" className="h-8 w-28" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-xl border border-nx-line bg-nx-ground p-3.5 space-y-2">
              <Skeleton shape="text" className="h-3 w-24" />
              <Skeleton shape="text" className="h-4 w-40" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border border-nx-line bg-nx-surface">
        <CardHeader className="pb-3">
          <Skeleton shape="title" className="h-5 w-52" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="rounded-xl border border-nx-line bg-nx-ground p-4 space-y-2">
              <Skeleton shape="text" className="h-4 w-44" />
              <Skeleton shape="text" className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </output>
  );
}

/** Loading placeholder for the Account Security Vault page. */
export function SecurityPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="security-skeleton" className="block space-y-5">
      <div className="space-y-2">
        <Skeleton shape="title" className="h-6 w-56" />
        <Skeleton shape="text" className="h-3.5 w-80" />
      </div>
      {Array.from({ length: 4 }, (_, idx) => (
        <Card key={idx} className="border border-nx-line bg-nx-surface">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
            <div className="space-y-2">
              <Skeleton shape="title" className="h-5 w-48" />
              <Skeleton shape="text" className="h-3 w-64" />
            </div>
            <Skeleton shape="control" className="h-8 w-32" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton shape="text" className="h-4 w-44" />
                <Skeleton shape="text" className="h-3 w-60" />
              </div>
              <Skeleton shape="chip" className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </output>
  );
}

/** Loading placeholder for the Workstation Sessions Radar page. */
export function SessionsPageSkeleton() {
  const label = useSkeletonRegionLabel();
  return (
    <output aria-busy="true" aria-label={label} data-testid="sessions-skeleton" className="block space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton shape="title" className="h-6 w-52" />
          <Skeleton shape="text" className="h-3.5 w-72" />
        </div>
        <Skeleton shape="control" className="h-8 w-36" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="border border-nx-line bg-nx-surface p-4 space-y-2">
            <Skeleton shape="text" className="h-3 w-28" />
            <Skeleton shape="title" className="h-6 w-20" />
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="border border-nx-line bg-nx-surface p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton shape="block" className="h-10 w-10 rounded-lg shrink-0" />
              <div className="space-y-2">
                <Skeleton shape="text" className="h-4 w-44" />
                <Skeleton shape="text" className="h-3 w-64" />
              </div>
            </div>
            <Skeleton shape="control" className="h-8 w-24" />
          </Card>
        ))}
      </div>
    </output>
  );
}
