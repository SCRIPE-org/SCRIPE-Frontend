"use client";

import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveFileUrl } from "@core/common/utils";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

interface PostCredentialWorkspaceSelectorProps {
  /** Validated email — shown in the header for context */
  email: string;
  /** List of workspaces returned by the backend after credential verification */
  workspaces: WorkspaceChoice[];
  /** Called when the user clicks a workspace card */
  onSelect: (workspace: WorkspaceChoice) => Promise<void> | void;
  /** Called when the user wants to go back and use a different account */
  onBack: () => void;
  /** Whether a workspace selection is being processed */
  isLoading?: boolean;
  /** Error message (e.g. login failed after workspace selection) */
  error?: string;
}

/**
 * PostCredentialWorkspaceSelector
 *
 * Shown AFTER credentials are validated when the email belongs to multiple tenants.
 * Credentials have been verified ✓ — no tokens issued yet.
 *
 * Design: premium card-grid with branding logos, role badges,
 * and clear disabled state for accounts not yet set up.
 *
 * Security: workspace tenantIds come from the backend — they are
 * encrypted IDs that will be used on the second login call.
 */
export function PostCredentialWorkspaceSelector({
  email,
  workspaces,
  onSelect,
  onBack,
  isLoading = false,
  error,
}: PostCredentialWorkspaceSelectorProps) {
  const { t } = useI18n();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  // Platform admin workspaces have tenantId="" from the backend.
  // Use a stable sentinel so React keys are unique and loading state is correct.
  const getWorkspaceKey = (ws: WorkspaceChoice) =>
    ws.isPlatformAdmin ? "__platform__" : ws.tenantId;

  const handleSelect = async (workspace: WorkspaceChoice) => {
    // Guard all non-interactive states
    if (!workspace.isActivated || workspace.isDisabled || isLoading) return;
    setSelectingId(getWorkspaceKey(workspace));
    try {
      await onSelect(workspace);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="w-full" role="main" aria-labelledby="workspace-selector-heading">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {t("auth.workspaceSelection.credentialsVerified") || "Credentials verified"}
          </p>
        </div>
        <h2
          id="workspace-selector-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {t("auth.workspaceSelection.heading") || "Choose a workspace"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.workspaceSelection.subtitle") ||
            `Your account (${email}) belongs to multiple workspaces.`}
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {/* ── Workspace Cards ── */}
      <ul className="flex flex-col gap-2" role="list" aria-label="Available workspaces">
        {workspaces.map((ws) => {
          const wsKey = getWorkspaceKey(ws);
          const isThisLoading = selectingId === wsKey;
          const isAnyLoading = isLoading || selectingId !== null;
          const isDisabled = !ws.isActivated || (isAnyLoading && !isThisLoading);

          return (
            <li key={wsKey}>
              <button
                type="button"
                onClick={() => handleSelect(ws)}
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
                  "group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left",
                  "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  ws.isActivated && !ws.isDisabled && !isDisabled
                    ? "cursor-pointer border-border bg-card hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm active:scale-[0.99]"
                    : "cursor-not-allowed border-border/50 bg-muted/20 opacity-60",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Workspace logo / icon */}
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

                {/* Workspace info */}
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
                    {/* Disabled: operational reason (suspended / deactivated) */}
                    {ws.isDisabled && ws.disabledReason && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                        <Ban className="h-2.5 w-2.5" aria-hidden />
                        {ws.disabledReason}
                      </span>
                    )}
                    {/* Disabled: first-time setup pending */}
                    {!ws.isActivated && !ws.isDisabled && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        <Clock className="h-2.5 w-2.5" aria-hidden />
                        {t("auth.workspaceSelection.setupPending") || "Setup pending"}
                      </span>
                    )}
                    {ws.isActivated && !ws.isPlatformAdmin && !ws.isDisabled && (
                      <span className="text-[11px] text-muted-foreground">
                        {ws.tenantCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right arrow / spinner */}
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
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── Back button ── */}
      <div className="mt-5 flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isLoading || selectingId !== null}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label={t("auth.workspaceSelection.backLabel") || "Use a different account"}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {t("auth.workspaceSelection.back") || "Use a different account"}
        </Button>
      </div>
    </div>
  );
}
