"use client";

import { AlertTriangle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { SlotConfig } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import type { AccessibilityConfig } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import type { useLoginViewModel } from "../viewmodels/use-login-viewmodel";
import type { useSsoProviders } from "../viewmodels/useSsoProviders";
import { CredentialsForm } from "./CredentialsForm";
import { PostCredentialWorkspaceSelector } from "./PostCredentialWorkspaceSelector";
import { SlotRenderer } from "./SlotRenderer";
import { SsoProviderButtons } from "./SsoProviderButtons";
import { TwoFactorForm } from "./TwoFactorForm";

type LoginViewModel = ReturnType<typeof useLoginViewModel>;
type SsoProvidersViewModel = ReturnType<typeof useSsoProviders>;

interface LoginFormRouterProps {
  vm: LoginViewModel;
  sso: SsoProvidersViewModel;
  tenantId: string | null;
  slotConfig: SlotConfig;
  a11y: AccessibilityConfig;
  isRTL: boolean;
  safeModeActive: boolean;
}

export function LoginFormRouter({
  vm,
  sso,
  tenantId,
  slotConfig,
  a11y,
  isRTL,
  safeModeActive,
}: LoginFormRouterProps) {
  const { t } = useI18n();

  return (
    <div
      id="login-main-content"
      className="w-full"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
      {...(a11y.ariaLandmarks ? { role: "main", "aria-label": t("auth.loginFormAriaLabel") } : {})}
    >
      {safeModeActive && (
        <div
          className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {t("auth.branding.safeModeActive")}
        </div>
      )}

      <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-6" />

      {vm.loginStep === "workspace-selection" ? (
        <PostCredentialWorkspaceSelector
          email={vm.formData.identifier}
          workspaces={vm.availableWorkspaces}
          onSelect={vm.selectWorkspace}
          onBack={vm.goBackToCredentials}
          isLoading={vm.isLoading}
          error={vm.error}
        />
      ) : vm.loginStep === "credentials" ? (
        <>
          <CredentialsForm
            formData={vm.formData}
            showPassword={vm.showPassword}
            isLoading={vm.isLoading}
            isFormValid={vm.isFormValid}
            error={vm.error}
            isRTL={isRTL}
            updateField={vm.updateField}
            togglePasswordVisibility={vm.togglePasswordVisibility}
            handleLogin={() => vm.handleLogin(tenantId ?? undefined)}
            errorAnnounce={a11y.errorAnnounce}
          />
          <SsoProviderButtons
            providers={sso.providers}
            isLoading={sso.isLoading}
            error={sso.error}
            onProviderClick={sso.initiateSsoLogin}
          />
        </>
      ) : (
        <TwoFactorForm
          twoFactorCode={vm.twoFactorCode}
          setTwoFactorCode={vm.setTwoFactorCode}
          useBackupCode={vm.useBackupCode}
          isVerifying2FA={vm.isVerifying2FA}
          error={vm.error}
          isRTL={isRTL}
          handleVerify2FA={vm.handleVerify2FA}
          toggleBackupCode={vm.toggleBackupCode}
          goBackToCredentials={vm.goBackToCredentials}
        />
      )}

      <SlotRenderer slotId="login.form.below" slotConfig={slotConfig} className="mt-6" />
    </div>
  );
}
