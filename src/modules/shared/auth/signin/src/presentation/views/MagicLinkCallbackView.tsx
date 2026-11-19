/**
 * MagicLinkCallbackView — Magic-link sign-in verification page (pure render).
 *
 * All business logic is in `useMagicLinkCallbackViewModel`.
 * Supports verifying, success, workspace-selection, hybrid two-factor step-up, and expired/error.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useMagicLinkCallbackViewModel } from "../viewmodels/useMagicLinkCallbackViewModel";
import { VaultBackground } from "../components/layouts/VaultBackground";
import { PostCredentialWorkspaceSelector } from "../components/PostCredentialWorkspaceSelector";
import { TwoFactorForm } from "../components/TwoFactorForm";

/**
 * Presentation UI component rendering the magic link callback verification screen.
 */
export function MagicLinkCallbackView() {
  const { t } = useI18n();
  const vm = useMagicLinkCallbackViewModel();
  const isRTL = vm.direction === "rtl";

  return (
    <div
      className="vault-stage relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden"
      dir={vm.direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />

      <main
        className={`relative z-[1] flex w-full flex-col items-center px-5 py-12 ${
          vm.state === "workspace-selection" ? "max-w-[480px]" : "max-w-[440px]"
        }`}
      >
        <div
          className={`sx-screen w-full rounded-[20px] p-8 sm:p-9 ${
            vm.state === "workspace-selection" || vm.state === "two-factor"
              ? "text-start"
              : "text-center"
          }`}
          style={{
            background: "var(--sx-card-bg)",
            border: "1px solid var(--sx-card-border)",
          }}
        >
          {vm.state === "verifying" && (
            <div className="flex flex-col items-center gap-5">
              <span
                className="sx-spin1 inline-block h-10 w-10 rounded-full border-[3px] border-nx-line border-t-[var(--sx-accent)]"
                aria-label={t("auth.magicLink.verifying")}
              />
              <p className="text-[14px]" style={{ color: "var(--sx-text-mute)" }}>
                {t("auth.magicLink.verifying")}
              </p>
            </div>
          )}

          {vm.state === "success" && (
            <div className="sx-pop flex flex-col items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle className="h-7 w-7 text-nx-success" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold" style={{ color: "var(--sx-text)" }}>
                  {t("auth.magicLink.successTitle")}
                </h1>
                <p className="text-[13px]" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.redirecting")}
                </p>
              </div>
            </div>
          )}

          {vm.state === "workspace-selection" && (
            <PostCredentialWorkspaceSelector
              email=""
              workspaces={vm.availableWorkspaces}
              onSelect={vm.selectWorkspace}
              onUnlock={async () => {}}
              onBack={vm.goBackToLogin}
              isLoading={vm.isSelectingWorkspace}
              error={vm.workspaceSelectionError}
            />
          )}

          {vm.state === "two-factor" && (
            <TwoFactorForm
              twoFactorCode={vm.twoFactorCode}
              setTwoFactorCode={vm.setTwoFactorCode}
              useBackupCode={vm.useBackupCode}
              isVerifying2FA={vm.isVerifying2FA}
              error={vm.twoFactorError}
              isRTL={isRTL}
              handleVerify2FA={() => void vm.handleVerify2FA()}
              toggleBackupCode={vm.toggleBackupCode}
              goBackToCredentials={vm.goBackToLogin}
            />
          )}

          {vm.state === "error" && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
                <AlertTriangle className="h-7 w-7 text-nx-warning-strong" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold" style={{ color: "var(--sx-text)" }}>
                  {t("auth.magicLink.expiredTitle")}
                </h1>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.magicLink.expiredDesc")}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <Button
                  asChild
                  className="h-12 w-full rounded-xl text-[15px] font-semibold text-nx-on-fill transition-colors"
                >
                  <Link href="/login">{t("auth.magicLink.requestNew")}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
