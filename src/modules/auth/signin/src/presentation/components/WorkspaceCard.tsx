"use client";

import { Building2, ShieldCheck, ArrowRight, Loader2, Clock, Ban } from "lucide-react";
import { resolveFileUrl } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

interface WorkspaceCardProps {
  workspace: WorkspaceChoice;
  isThisLoading: boolean;
  isDisabled: boolean;
  onSelect: (ws: WorkspaceChoice) => void;
}

/**
 * WorkspaceCard — A single selectable workspace entry.
 *
 * Extracted from PostCredentialWorkspaceSelector to keep that
 * component under 200 lines. Purely presentational — all
 * selection logic stays in the parent.
 */
export function WorkspaceCard({
  workspace: ws,
  isThisLoading,
  isDisabled,
  onSelect,
}: WorkspaceCardProps) {
  const { t } = useI18n();

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={() => onSelect(ws)}
      disabled={isDisabled || !ws.isActivated || !!ws.isDisabled}
      aria-label={`${ws.tenantName}${
        !ws.isActivated
          ? ` — ${t("auth.workspaceSelection.setupPending") || "Setup pending"}`
          : ws.isDisabled
            ? ` — ${ws.disabledReason || "Unavailable"}`
            : ""
      }`}
      aria-busy={isThisLoading}
      className={[
        "group flex h-auto w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        ws.isActivated && !ws.isDisabled && !isDisabled
          ? "cursor-pointer border-border bg-card hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm active:scale-[0.99]"
          : "cursor-not-allowed border-border/50 bg-muted/20 opacity-60",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Logo / icon */}
      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
          ws.isPlatformAdmin
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-border bg-muted text-muted-foreground",
        ].join(" ")}
        aria-hidden
      >
        {ws.logoUrl ? (
          <img
            src={resolveFileUrl(ws.logoUrl)}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : ws.isPlatformAdmin ? (
          <ShieldCheck className="h-5 w-5" />
        ) : (
          <Building2 className="h-5 w-5" />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold leading-tight text-foreground">
          {ws.tenantName}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {ws.isPlatformAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <ShieldCheck className="h-2.5 w-2.5" aria-hidden />
              {t("auth.workspaceSelection.platform") || "Platform"}
            </span>
          )}
          {ws.isDisabled && ws.disabledReason && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
              <Ban className="h-2.5 w-2.5" aria-hidden />
              {ws.disabledReason}
            </span>
          )}
          {!ws.isActivated && !ws.isDisabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              <Clock className="h-2.5 w-2.5" aria-hidden />
              {t("auth.workspaceSelection.setupPending") || "Setup pending"}
            </span>
          )}
          {ws.isActivated && !ws.isPlatformAdmin && !ws.isDisabled && (
            <span className="text-[11px] text-muted-foreground">{ws.tenantCode}</span>
          )}
        </div>
      </div>

      {/* Arrow / spinner */}
      <div className="shrink-0 text-muted-foreground">
        {isThisLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : ws.isActivated ? (
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        ) : null}
      </div>
    </Button>
  );
}
