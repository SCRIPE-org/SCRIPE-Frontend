"use client";

import { useDevelopersViewModel } from "../viewmodels/useDevelopersViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";
import { ShieldCheck, Search, Users } from "lucide-react";

/**
 * Presentation UI component rendering the developers view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DevelopersView() {
  const vm = useDevelopersViewModel();
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-nx-ink">{t("marketplace.developersTitle")}</h2>
          <p className="text-sm text-nx-ink-2">
            {t("marketplace.developersStatsSummary", {
              total: vm.stats.total,
              verified: vm.stats.verified,
            })}
          </p>
        </div>
        <div className="relative w-64">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            placeholder={t("marketplace.developersSearchPlaceholder")}
            aria-label={t("marketplace.developersSearchPlaceholder")}
            className="ps-9"
            onChange={(e) => vm.setSearch(e.target.value)}
          />
        </div>
      </div>

      {vm.isLoading ? (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          role="status"
          aria-busy="true"
          aria-label={t("common.loading")}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-nx-lg" />
          ))}
        </div>
      ) : vm.developers.length === 0 ? (
        <EmptyState size="lg" icon={Users} title={t("marketplace.developersEmpty")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {vm.developers.map((dev) => (
            <Card key={dev.id}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-nx-raised text-sm font-bold text-nx-ink-2"
                  aria-hidden="true"
                >
                  {dev.displayName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-nx-ink">
                      {dev.displayName}
                    </span>
                    {dev.isVerified && (
                      <ShieldCheck
                        className="size-3.5 shrink-0 text-info"
                        aria-label={t("marketplace.developersVerifiedAriaLabel")}
                      />
                    )}
                  </div>
                  <p className="truncate text-xs text-nx-ink-2">{dev.contactEmail}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {t("marketplace.developersAppsCount", { count: dev.appCount })}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <span className="text-sm font-semibold text-success">{dev.revenueLabel}</span>
                {!dev.isVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => vm.verify(dev.id)}
                    disabled={vm.isVerifying}
                  >
                    <ShieldCheck className="size-3.5" aria-hidden="true" />{" "}
                    {t("marketplace.developersVerifyAction")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
