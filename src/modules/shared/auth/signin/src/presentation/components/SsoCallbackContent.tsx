"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert, UserX } from "lucide-react";
import { BRAND } from "@core/config/branding";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { NxThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Logo } from "@core/ui/logo";
import { useI18n } from "@core/providers/i18n-provider";
import type { SsoCallbackError, SsoCallbackState } from "../viewmodels/useSsoCallbackHandler";
import { PostCredentialWorkspaceSelector } from "./PostCredentialWorkspaceSelector";
import { TwoFactorForm } from "./TwoFactorForm";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

interface SsoCallbackContentProps {
  state: SsoCallbackState;
  errorInfo: SsoCallbackError | null;
  errorCode?: string | null;
  workspaceData?: { workspaces: WorkspaceChoice[]; token: string } | null;
  workspaceEmail?: string;
  isSelectingWorkspace?: boolean;
  selectionError?: string;
  handleSelectWorkspace?: (workspace: WorkspaceChoice) => Promise<void> | void;
  handleBack?: () => void;
  twoFactorCode?: string;
  setTwoFactorCode?: (code: string) => void;
  useBackupCode?: boolean;
  isVerifying2FA?: boolean;
  twoFactorError?: string;
  handleVerify2FA?: () => void;
  toggleBackupCode?: () => void;
}

/**
 * Presentation UI component rendering SSO callback processing, success, errors,
 * multi-workspace selection, and hybrid IdP MFA step-up verification inside an
 * enterprise-framed authentication shell with brand chrome and theme/locale controls.
 */
export function SsoCallbackContent({
  state,
  errorInfo,
  errorCode,
  workspaceData,
  workspaceEmail,
  isSelectingWorkspace,
  selectionError,
  handleSelectWorkspace,
  handleBack,
  twoFactorCode = "",
  setTwoFactorCode,
  useBackupCode = false,
  isVerifying2FA = false,
  twoFactorError = "",
  handleVerify2FA,
  toggleBackupCode,
}: SsoCallbackContentProps) {
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";

  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col bg-nx-ground text-nx-ink"
      dir={direction}
    >
      <header className="flex w-full items-center justify-between border-b border-nx-line bg-nx-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo size="md" showText={false} disableLink />
          <span className="text-sm font-semibold tracking-tight text-nx-ink">
            {BRAND.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NxThemeSwitcher variant="solid" />
          <LanguageSwitcher buttonClassName="h-9 min-w-[36px] px-2" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          {state === "processing" && (
            <Card className="border-nx-line bg-nx-surface p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-nx-accent-wash">
                  <LoadingSpinner size="md" showText={false} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-nx-ink">
                    {t("auth.sso.callbackProcessing")}
                  </h1>
                  <p className="mt-2 text-sm text-nx-ink-2">
                    {t("auth.sso.callbackProcessingDesc")}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {state === "success" && (
            <Card className="border-nx-line bg-nx-surface p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                  <CheckCircle className="h-9 w-9 text-nx-success" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-nx-ink">
                    {t("auth.sso.loginSuccess")}
                  </h1>
                  <p className="mt-2 text-sm text-nx-ink-2">{t("auth.sso.redirecting")}</p>
                </div>
              </div>
            </Card>
          )}

          {state === "no_linked_account" && (
            <Card className="border-nx-line bg-nx-surface p-6 shadow-sm sm:p-8">
              <div role="alert" aria-live="polite" className="flex flex-col items-center gap-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10">
                  <UserX className="h-9 w-9 text-nx-warning-strong" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-nx-ink">{errorInfo?.title}</h1>
                  <p className="mt-2 text-sm leading-relaxed text-nx-ink-2">
                    {errorInfo?.message}
                  </p>
                  {errorCode && (
                    <code
                      dir="ltr"
                      className="mt-3 inline-block rounded-md border border-nx-line bg-nx-raised px-2.5 py-0.5 font-mono text-[11px] text-nx-ink-3"
                    >
                      {errorCode}
                    </code>
                  )}
                </div>
                <Button variant="outline" className="gap-2" asChild>
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    {t("auth.sso.backToLogin")}
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {state === "error" && (
            <Card className="border-nx-line bg-nx-surface p-6 shadow-sm sm:p-8">
              <div role="alert" aria-live="assertive" className="flex flex-col items-center gap-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                  <ShieldAlert className="h-9 w-9 text-nx-danger" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-nx-ink">{errorInfo?.title}</h1>
                  <p className="mt-2 text-sm leading-relaxed text-nx-ink-2">
                    {errorInfo?.message}
                  </p>
                  {errorCode && (
                    <code
                      dir="ltr"
                      className="mt-3 inline-block rounded-md border border-nx-line bg-nx-raised px-2.5 py-0.5 font-mono text-[11px] text-nx-ink-3"
                    >
                      {errorCode}
                    </code>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" className="gap-2" asChild>
                    <Link href="/login">
                      <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                      {t("auth.sso.backToLogin")}
                    </Link>
                  </Button>
                  {(errorCode === "account_locked" ||
                    errorCode === "auth_account_locked" ||
                    errorCode === "invalid_credentials") && (
                    <Button variant="ghost" asChild>
                      <Link href="/forgot-password">{t("auth.forgotPassword")}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {state === "workspace_selection" && workspaceData && (
            <PostCredentialWorkspaceSelector
              email={workspaceEmail || ""}
              workspaces={workspaceData.workspaces}
              onSelect={(ws) => {
                void Promise.resolve(handleSelectWorkspace?.(ws)).catch(() => {});
              }}
              onUnlock={async () => {}}
              onBack={handleBack || (() => {})}
              isLoading={isSelectingWorkspace}
              error={selectionError}
            />
          )}

          {state === "two_factor" && (
            <Card className="border-nx-line bg-nx-surface p-6 shadow-sm sm:p-8">
              <TwoFactorForm
                twoFactorCode={twoFactorCode}
                setTwoFactorCode={setTwoFactorCode || (() => {})}
                useBackupCode={useBackupCode}
                isVerifying2FA={isVerifying2FA}
                error={twoFactorError}
                isRTL={isRTL}
                handleVerify2FA={handleVerify2FA || (() => {})}
                toggleBackupCode={toggleBackupCode || (() => {})}
                goBackToCredentials={handleBack || (() => {})}
              />
            </Card>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-nx-ink-3">
        © {new Date().getFullYear()} {BRAND.name}
      </footer>
    </div>
  );
}
