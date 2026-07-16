"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert, UserX } from "lucide-react";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import type { SsoCallbackError, SsoCallbackState } from "../viewmodels/useSsoCallbackHandler";
import { PostCredentialWorkspaceSelector } from "./PostCredentialWorkspaceSelector";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

interface SsoCallbackContentProps {
  state: SsoCallbackState;
  errorInfo: SsoCallbackError | null;
  workspaceData?: { workspaces: WorkspaceChoice[]; token: string } | null;
  workspaceEmail?: string;
  isSelectingWorkspace?: boolean;
  selectionError?: string;
  handleSelectWorkspace?: (workspace: WorkspaceChoice) => Promise<void> | void;
  handleBack?: () => void;
}

/**
 * Presentation UI component rendering the sso callback content.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SsoCallbackContent({
  state,
  errorInfo,
  workspaceData,
  workspaceEmail,
  isSelectingWorkspace,
  selectionError,
  handleSelectWorkspace,
  handleBack,
}: SsoCallbackContentProps) {
  const { t, direction } = useI18n();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-6"
      dir={direction}
    >
      <div className="w-full max-w-md">
        {state === "processing" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <LoadingSpinner size="md" showText={false} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t("auth.sso.callbackProcessing")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("auth.sso.callbackProcessingDesc")}
              </p>
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t("auth.sso.loginSuccess")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("auth.sso.redirecting")}</p>
            </div>
          </div>
        )}

        {state === "no_linked_account" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10">
              <UserX className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{errorInfo?.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {errorInfo?.message}
              </p>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                {t("auth.sso.backToLogin")}
              </Link>
            </Button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{errorInfo?.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {errorInfo?.message}
              </p>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                {t("auth.sso.backToLogin")}
              </Link>
            </Button>
          </div>
        )}
        {state === "workspace_selection" && workspaceData && (
          <PostCredentialWorkspaceSelector
            email={workspaceEmail || ""}
            workspaces={workspaceData.workspaces}
            onSelect={handleSelectWorkspace || (() => {})}
            onUnlock={async () => {}}
            onBack={handleBack || (() => {})}
            isLoading={isSelectingWorkspace}
            error={selectionError}
          />
        )}
      </div>
    </div>
  );
}
