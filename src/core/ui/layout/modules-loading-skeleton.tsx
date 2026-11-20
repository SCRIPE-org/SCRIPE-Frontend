"use client";

import { Card, CardContent } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";

export type ModulesLoadingVariant = "default" | "table" | "cards" | "crm" | "detail";

interface ModulesLoadingSkeletonProps {
  variant?: ModulesLoadingVariant;
}

/**
 * Shared DashboardLayout-compatible loading skeleton for `(modules)` routes,
 * Suspense boundaries, and unprefetched segment transitions.
 */
export function ModulesLoadingSkeleton({ variant = "default" }: ModulesLoadingSkeletonProps) {
  const { t } = useI18n();

  if (variant === "detail") {
    return (
      <output
        data-testid="modules-loading-skeleton"
        data-variant="detail"
        className="flex flex-col gap-6"
        aria-busy="true"
        aria-label={t("common.loading")}
      >
        <div className="flex items-center justify-between gap-4 border-b border-nx-line pb-4">
          <div className="space-y-2">
            <Skeleton shape="text" className="w-32" />
            <Skeleton shape="title" className="h-7 w-64" />
            <Skeleton shape="text" className="w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton shape="control" className="w-24" />
            <Skeleton shape="control" className="w-28" />
          </div>
        </div>

        <SectionState isLoading skeletonType="cards">
          {null}
        </SectionState>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="space-y-4 pt-6">
              <Skeleton shape="title" className="w-40" />
              <SectionState isLoading skeletonType="rows" skeletonRows={5}>
                {null}
              </SectionState>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton shape="title" className="w-32" />
              <SectionState isLoading skeletonType="rows" skeletonRows={4}>
                {null}
              </SectionState>
            </CardContent>
          </Card>
        </div>
      </output>
    );
  }

  return (
    <output
      data-testid="modules-loading-skeleton"
      data-variant={variant}
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label={t("common.loading")}
    >
      {/* Page header skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-nx-line pb-4">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton shape="title" />
            <Skeleton shape="text" className="w-72" />
          </div>
        </div>
        <Skeleton shape="control" className="w-28" />
      </div>

      {/* Filter / search bar for CRM & table-heavy routes */}
      {(variant === "crm" || variant === "table") && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton shape="control" className="w-64" />
          <div className="flex items-center gap-2">
            <Skeleton shape="control" className="w-28" />
            <Skeleton shape="control" className="w-28" />
          </div>
        </div>
      )}

      {/* Card grid or KPI strip */}
      {variant === "cards" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <Skeleton shape="circle" className="h-10 w-10" />
                <Skeleton shape="title" className="h-5 w-36" />
                <Skeleton shape="text" className="w-full" />
                <Skeleton shape="text" className="w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {variant !== "table" && (
            <SectionState isLoading skeletonType="cards">
              {null}
            </SectionState>
          )}

          {/* Main table / list slab */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton shape="title" className="w-36" />
              <SectionState isLoading skeletonType="rows" skeletonRows={variant === "table" ? 6 : 5}>
                {null}
              </SectionState>
            </CardContent>
          </Card>
        </>
      )}
    </output>
  );
}
