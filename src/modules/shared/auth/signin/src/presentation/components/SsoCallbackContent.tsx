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
      className="flex min-h-[100dvh] items-center justify-center bg-nx-ground p-6 text-nx-ink"
      dir={direction}
    >
      <div className="w-full max-w-md">
        {state === "processing" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-nx-accent-wash">
              <LoadingSpinner size="md" showText={false} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nx-ink">
                {t("auth.sso.callbackProcessing")}
              </h2>
              <p className="mt-2 text-sm text-nx-ink-2">
                {t("auth.sso.callbackProcessingDesc")}
              </p>
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10">
              <CheckCircle className="h-10 w-10 text-nx-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nx-ink">
                {t("auth.sso.loginSuccess")}
              </h2>
              <p className="mt-2 text-sm text-nx-ink-2">{t("auth.sso.redirecting")}</p>
            </div>
          </div>
        )}

        {state === "no_linked_account" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
              <UserX className="h-10 w-10 text-nx-warning-strong" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nx-ink">{errorInfo?.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-nx-ink-2">
                {errorInfo?.message}
              </p>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {t("auth.sso.backToLogin")}
              </Link>
            </Button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
              <ShieldAlert className="h-10 w-10 text-nx-danger" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nx-ink">{errorInfo?.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-nx-ink-2">
                {errorInfo?.message}
              </p>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
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
