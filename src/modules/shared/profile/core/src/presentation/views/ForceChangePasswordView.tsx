"use client";

import { BRAND } from "@core/config/branding";
import { Logo } from "@core/ui/logo";
import { NxThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { useForceChangePasswordViewModel } from "../viewmodels/useForceChangePasswordViewModel";
import { ForceChangePasswordCardSection } from "../sections/force-change/ForceChangePasswordCardSection";

/**
 * Focused first-login and mandatory password rotation view matching MMC UX parity.
 */
export function ForceChangePasswordView() {
  const vm = useForceChangePasswordViewModel();

  return (
    <div dir={vm.direction} className="flex min-h-[100dvh] w-full flex-col bg-nx-ground">
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
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-5">
          <ForceChangePasswordCardSection
            t={vm.t}
            username={vm.username}
            newPassword={vm.newPassword}
            onNewPasswordChange={vm.setNewPassword}
            confirmPassword={vm.confirmPassword}
            onConfirmPasswordChange={vm.setConfirmPassword}
            policy={vm.policy}
            isPolicyLoading={vm.isPolicyLoading}
            policyError={vm.policyError}
            onRetryPolicy={() => void vm.refetchPolicy()}
            isSubmitting={vm.isSubmitting}
            submitError={vm.submitError}
            showMismatch={vm.showMismatch}
            canSubmit={vm.canSubmit}
            onSubmit={vm.handleSubmit}
            onLogout={vm.handleLogout}
          />
        </div>
      </main>
    </div>
  );
}
