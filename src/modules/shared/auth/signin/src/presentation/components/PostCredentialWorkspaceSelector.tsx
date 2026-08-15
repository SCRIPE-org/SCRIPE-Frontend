"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Lock, Unlock } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import { WorkspaceCard } from "./WorkspaceCard";

interface PostCredentialWorkspaceSelectorProps {
  /** Validated email — shown in the header for context */
  email: string;
  /** List of workspaces returned by the backend after credential verification */
  workspaces: WorkspaceChoice[];
  /** Called when the user clicks an unlocked workspace card */
  onSelect: (workspace: WorkspaceChoice) => Promise<void> | void;
  /** Called when the user submits an inline password to unlock a workspace */
  onUnlock: (workspace: WorkspaceChoice, password: string) => Promise<void>;
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
 * Shown when the email belongs to multiple tenants. Implements the
 * "hybrid picker" UX:
 *
 *   ✅ unlocked cards  → direct click to log in (password already verified)
 *   🔒 locked cards    → expandable inline password form to unlock that workspace
 *   🚫 disabled cards  → non-interactive (suspended tenant / deactivated account)
 *   ⏳ setup cards     → non-interactive (first-time setup pending)
 *
 * Credentials for AT LEAST ONE workspace have been verified — no tokens
 * are issued until the user selects a workspace.
 */
export function PostCredentialWorkspaceSelector({
  email,
  workspaces,
  onSelect,
  onUnlock,
  onBack,
  isLoading = false,
  error,
}: PostCredentialWorkspaceSelectorProps) {
  const { t } = useI18n();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const getWorkspaceKey = (ws: WorkspaceChoice): string =>
    ws.isPlatformAdmin ? "__platform__" : ws.tenantId;

  const handleSelect = async (workspace: WorkspaceChoice) => {
    if (isLoading || selectingId !== null) return;
    const key = getWorkspaceKey(workspace);
    setSelectingId(key);
    try {
      await onSelect(workspace);
    } finally {
      setSelectingId(null);
    }
  };

  // Counts for the header hint
  const unlockedCount = workspaces.filter(
    (w) => w.isActivated && !w.isDisabled && !w.isLocked && w.isPasswordVerified !== false
  ).length;
  const lockedCount = workspaces.filter(
    (w) => w.isActivated && !w.isDisabled && !w.isLocked && w.isPasswordVerified === false
  ).length;

  return (
    <div className="w-full" role="main" aria-labelledby="workspace-selector-heading">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          {unlockedCount > 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
              <p className="text-sm font-medium text-success">
                {t("auth.workspaceSelection.credentialsVerified") || "Credentials verified"}
              </p>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 shrink-0 text-warning" aria-hidden />
              <p className="text-sm font-medium text-warning">
                {t("auth.workspaceSelection.enterPasswordForWorkspace") ||
                  "Enter the password for a workspace to sign in"}
              </p>
            </>
          )}
        </div>

        <h2
          id="workspace-selector-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {t("auth.workspaceSelection.heading") || "Choose a workspace"}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {lockedCount > 0 && unlockedCount > 0
            ? t("auth.workspaceSelection.subtitleMixed") ||
              `Your account (${email}) has ${unlockedCount} unlocked and ${lockedCount} password-protected workspace(s).`
            : lockedCount > 0
              ? t("auth.workspaceSelection.subtitleAllLocked") ||
                `Your account (${email}) belongs to ${workspaces.length} workspace(s). Enter a password to access.`
              : t("auth.workspaceSelection.subtitle") ||
                `Your account (${email}) belongs to multiple workspaces.`}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error.startsWith("auth.") ? t(error as any) : error}</span>
        </div>
      )}

      {/* Workspace Cards */}
      <ul
        className="flex flex-col gap-2"
        role="list"
        aria-label={t("auth.workspaceSelection.availableWorkspaces") || "Available workspaces"}
      >
        {workspaces.map((ws) => {
          const wsKey = getWorkspaceKey(ws);
          const isThisLoading = selectingId === wsKey;
          const isAnyLoading = isLoading || selectingId !== null;

          return (
            <li key={wsKey}>
              <WorkspaceCard
                workspace={ws}
                isThisLoading={isThisLoading}
                isAnyLoading={isAnyLoading}
                onSelect={handleSelect}
                onUnlock={onUnlock}
              />
            </li>
          );
        })}
      </ul>

      {/* Unlock hint when there are locked workspaces */}
      {lockedCount > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Unlock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t("auth.workspaceSelection.unlockHint") ||
            "Click a locked workspace to enter its password and gain access."}
        </p>
      )}

      {/* Back button */}
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
