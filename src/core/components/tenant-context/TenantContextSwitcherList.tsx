"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, Building2, Check, LogOut, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import {
  useTenantContextSwitcher,
  type SwitchableTenantCandidate,
} from "@core/hooks/useTenantContextSwitcher";

export interface TenantContextSwitcherListProps {
  /** Override destination path after switch (defaults to current pathname+search). */
  redirectTo?: string | null;
  /** Optional exit destination when returning to platform context (defaults to current pathname+search). */
  exitRedirectTo?: string | null;
  /** Callback fired immediately before navigation (e.g. to close an enclosing dialog). */
  onSwitched?: (candidate: SwitchableTenantCandidate) => void;
  /** Show an explicit button to exit active tenant context back to platform root. */
  showExitToPlatform?: boolean;
  /** Optional switcher state passed down from a parent hook consumer to avoid double queries. */
  switcherState?: ReturnType<typeof useTenantContextSwitcher>;
  className?: string;
}

function getCandidateDisplayName(candidate: SwitchableTenantCandidate, isAr: boolean): string {
  if (isAr && candidate.nameAr) return candidate.nameAr;
  return candidate.nameEn || candidate.name;
}

/**
 * Searchable inline organization selector used inside TenantContextRequiredGate,
 * Topbar Switcher Dialog, App Launcher, and Data Exchange fallback guidance.
 */
export function TenantContextSwitcherList({
  redirectTo,
  exitRedirectTo,
  onSwitched,
  showExitToPlatform = false,
  switcherState,
  className,
}: TenantContextSwitcherListProps): React.ReactElement {
  const { t, language, direction } = useI18n();
  const isAr = language === "ar";
  const internalSwitcher = useTenantContextSwitcher({ enabled: !switcherState });
  const switcher = switcherState ?? internalSwitcher;

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return switcher.candidates;
    return switcher.candidates.filter((item) => {
      const haystacks = [
        item.name,
        item.nameEn,
        item.nameAr,
        item.code,
        item.slug,
        item.effectiveRoleCode,
      ]
        .filter((val): val is string => Boolean(val))
        .map((val) => val.toLowerCase());
      return haystacks.some((value) => value.includes(q));
    });
  }, [switcher.candidates, searchQuery]);

  const handleSelect = async (candidate: SwitchableTenantCandidate) => {
    const ok = await switcher.switchToTenant(candidate, { redirectTo });
    if (ok) {
      onSwitched?.(candidate);
    }
  };

  if (switcher.isLoading) {
    return (
      <div
        dir={direction}
        data-testid="tenant-switcher-loading"
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-8 text-center",
          className
        )}
      >
        <LoadingSpinner size="sm" />
        <p className="text-xs font-medium text-nx-ink-2">{t("contextGates.switcher.loading")}</p>
      </div>
    );
  }

  if (switcher.loadError) {
    return (
      <div
        dir={direction}
        data-testid="tenant-switcher-error"
        className={cn(
          "flex flex-col items-start gap-3 rounded-nx-md border border-destructive/30 bg-destructive/10 p-4",
          className
        )}
      >
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-nx-ink">{t("contextGates.switcher.loadError")}</p>
            <p className="text-xs text-nx-ink-2">{switcher.loadError}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void switcher.refetchCandidates()}
          data-testid="tenant-switcher-retry"
        >
          <RefreshCw className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("contextGates.common.retry")}</span>
        </Button>
      </div>
    );
  }

  if (switcher.candidates.length === 0) {
    return (
      <div
        dir={direction}
        data-testid="tenant-switcher-empty"
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-6 text-center",
          className
        )}
      >
        <Building2 className="h-5 w-5 text-nx-ink-3" aria-hidden="true" />
        <p className="text-sm font-medium text-nx-ink">{t("contextGates.switcher.emptyTitle")}</p>
        <p className="max-w-md text-xs leading-relaxed text-nx-ink-2">
          {t("contextGates.switcher.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div dir={direction} className={cn("space-y-3", className)} data-testid="tenant-switcher-list">
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("contextGates.switcher.searchPlaceholder")}
          aria-label={t("contextGates.switcher.searchPlaceholder")}
          className="ps-9"
          data-testid="tenant-switcher-search"
        />
      </div>

      {switcher.switchError && (
        <div
          role="alert"
          data-testid="tenant-switcher-switch-error"
          className="rounded-nx-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-nx-ink"
        >
          {t("contextGates.switcher.switchError")}
        </div>
      )}

      {filteredCandidates.length === 0 ? (
        <div className="rounded-nx-md border border-nx-line bg-nx-raised px-4 py-6 text-center text-xs text-nx-ink-2">
          {t("contextGates.switcher.noSearchResults", { query: searchQuery.trim() })}
        </div>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto pe-0.5">
          {filteredCandidates.map((candidate) => {
            const displayName = getCandidateDisplayName(candidate, isAr);
            const isCurrent = candidate.id === switcher.activeTenantId;
            const isBusy = switcher.isSwitching && switcher.switchingTenantId === candidate.id;
            const sourceLabel =
              candidate.source === "membership"
                ? t("contextGates.switcher.membershipSource")
                : t("contextGates.switcher.drillDownSource");

            return (
              <li
                key={candidate.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-nx-md border border-nx-line bg-nx-raised px-3.5 py-2.5 transition-colors duration-nx-micro hover:border-nx-line-hi"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-control border border-nx-line bg-nx-surface text-nx-ink-2">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-nx-ink">
                        {displayName}
                      </span>
                      {isCurrent && (
                        <Badge variant="success" className="text-[11px]">
                          <Check className="h-3 w-3" aria-hidden="true" />
                          <span>{t("contextGates.switcher.activeBadge")}</span>
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[11px]">
                        {sourceLabel}
                      </Badge>
                    </div>
                    {(candidate.code || candidate.effectiveRoleCode) && (
                      <p className="mt-0.5 truncate text-xs text-nx-ink-3 tabular-nums">
                        {[candidate.code, candidate.effectiveRoleCode].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={switcher.isSwitching || isCurrent}
                  onClick={() => void handleSelect(candidate)}
                  data-testid={`tenant-switch-option-${candidate.id}`}
                >
                  <span>
                    {isBusy
                      ? t("contextGates.switcher.switchingAction")
                      : isCurrent
                        ? t("contextGates.switcher.activeBadge")
                        : t("contextGates.switcher.switchAction")}
                  </span>
                  {!isCurrent && !isBusy && (
                    <ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {showExitToPlatform && switcher.isInTenantWorld && (
        <div className="flex justify-end border-t border-nx-line pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={switcher.isSwitching}
            onClick={() => switcher.exitToPlatform({ redirectTo: exitRedirectTo })}
            data-testid="tenant-switcher-exit-platform"
          >
            <LogOut className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("contextGates.switcher.exitToPlatform")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
