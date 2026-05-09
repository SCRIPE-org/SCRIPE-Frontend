"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import { WorkspaceCard } from "./WorkspaceCard";

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

  const getWorkspaceKey = (ws: WorkspaceChoice) =>
    ws.isPlatformAdmin ? "__platform__" : ws.tenantId;

  const handleSelect = async (workspace: WorkspaceChoice) => {
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
      {/* Header */}
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

      {/* Error Banner */}
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

      {/* Workspace Cards */}
      <ul className="flex flex-col gap-2" role="list" aria-label="Available workspaces">
        {workspaces.map((ws) => {
          const wsKey = getWorkspaceKey(ws);
          const isThisLoading = selectingId === wsKey;
          const isAnyLoading = isLoading || selectingId !== null;
          const isDisabled = !ws.isActivated || (isAnyLoading && !isThisLoading);
          return (
            <li key={wsKey}>
              <WorkspaceCard
                workspace={ws}
                isThisLoading={isThisLoading}
                isDisabled={isDisabled}
                onSelect={handleSelect}
              />
            </li>
          );
        })}
      </ul>

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
