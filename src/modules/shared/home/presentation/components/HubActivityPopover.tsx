"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, ChevronRight, Clock, RefreshCw, ShieldAlert } from "lucide-react";
import { resolveIntlLocale } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Skeleton } from "@core/ui/skeleton";
import type { HubSignInActivityFeed } from "../../hub/src/domain/entities/HubPersonalFeed";

/** Props for {@link HubActivityPopover}. */
export interface HubActivityPopoverProps {
  /** Whether the active session is an admin impersonation session. */
  isImpersonating: boolean;
  /** Personal sign-in and account activity feed (`/api/v1/account/activity?pageSize=5`). */
  activity?: HubSignInActivityFeed;
  /** True while activity is loading. */
  isLoading: boolean;
  /** True when the activity fetch failed. */
  isError: boolean;
  /** Callback to retry fetching account activity. */
  onRetry: () => void;
  /** Controlled open state (optional). */
  open?: boolean;
  /** Controlled open change handler (optional). */
  onOpenChange?: (open: boolean) => void;
}

function formatTimestamp(isoString: string, language: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString(resolveIntlLocale(language), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveOutcomeVariant(outcome: string): "success" | "destructive" | "secondary" {
  const normalized = outcome.toLowerCase();
  if (normalized === "success" || normalized === "succeeded") return "success";
  if (normalized === "blocked" || normalized === "failure" || normalized === "failed") {
    return "destructive";
  }
  return "secondary";
}

/**
 * Compact topbar popover displaying the operator's recent account and sign-in activity
 * from `/api/v1/account/activity?pageSize=5` with outcome badges and impersonation guards.
 */
export function HubActivityPopover({
  isImpersonating,
  activity,
  isLoading,
  isError,
  onRetry,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: HubActivityPopoverProps) {
  const { t, language, direction } = useI18n();
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (next: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(next);
    else setInternalOpen(next);
  };

  const entries = activity?.entries ?? [];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-testid="hub-activity-trigger"
          aria-label={t("workspaceHub.signInActivity.title")}
          className="h-8 w-8 shrink-0 rounded-nx-control border border-nx-line bg-nx-surface text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink sm:h-9 sm:w-9"
        >
          <Clock className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        dir={direction}
        data-testid="hub-activity-popover"
        className="w-[360px] max-w-[calc(100vw-24px)] border-nx-line bg-nx-surface p-0 text-nx-ink"
      >
        <div className="flex items-center justify-between gap-2 border-b border-nx-line px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-nx-ink">
            {t("workspaceHub.signInActivity.title")}
          </h2>
        </div>

        {isImpersonating ? (
          <div className="p-3">
            <Alert variant="warning" data-testid="hub-activity-impersonation-alert">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <AlertDescription className="text-xs leading-relaxed">
                {t("workspaceHub.impersonationHidden")}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="max-h-[340px] overflow-y-auto p-3">
            {isLoading ? (
              <div className="space-y-3" aria-busy="true">
                <Skeleton shape="text" className="h-4 w-3/4" />
                <Skeleton shape="text" className="h-3 w-1/2" />
                <Skeleton shape="text" className="h-4 w-5/6" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-start gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3">
                <p className="text-xs text-nx-ink-2">{t("workspaceHub.signInActivity.error")}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-7 gap-1.5 text-xs"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  {t("workspaceHub.signInActivity.retry")}
                </Button>
              </div>
            ) : entries.length === 0 ? (
              <EmptyState
                size="sm"
                bare
                icon={Activity}
                title={t("workspaceHub.signInActivity.empty")}
              />
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-nx-md border border-nx-line bg-nx-raised px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-nx-ink">
                        <bdi>{entry.eventType}</bdi>
                      </span>
                      <Badge
                        variant={resolveOutcomeVariant(entry.outcome)}
                        className="shrink-0 px-2 py-0 text-[10.5px]"
                      >
                        <bdi>{entry.outcome}</bdi>
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-nx-ink-3">
                      <span className="truncate font-mono">
                        <bdi dir="ltr">
                          {entry.ipAddress ||
                            entry.endpoint ||
                            t("workspaceHub.signInActivity.unknownIp")}
                        </bdi>
                      </span>
                      <span className="shrink-0 tabular-nums">
                        <bdi>{formatTimestamp(entry.timestampUtc, language)}</bdi>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="border-t border-nx-line px-4 py-2.5">
          <Link
            href="/account/activity"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 text-xs font-medium text-nx-ink-2 transition-colors hover:text-nx-ink"
          >
            <span>{t("workspaceHub.signInActivity.viewAll")}</span>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
