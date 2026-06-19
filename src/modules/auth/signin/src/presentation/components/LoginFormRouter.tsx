"use client";

import { AlertTriangle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { SlotConfig } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import type { AccessibilityConfig } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import type { useLoginViewModel } from "../viewmodels/use-login-viewmodel";
import type { useSsoProviders } from "../viewmodels/useSsoProviders";
import { CredentialsForm } from "./CredentialsForm";
import { MagicLinkRequestForm } from "./MagicLinkRequestForm";
import { MagicLinkSentScreen } from "./MagicLinkSentScreen";
import { PostCredentialWorkspaceSelector } from "./PostCredentialWorkspaceSelector";
import { SlotRenderer } from "./SlotRenderer";
import { SsoProviderButtons } from "./SsoProviderButtons";
import { TwoFactorForm } from "./TwoFactorForm";
import { PhoneOtpForm } from "./PhoneOtpForm";
import { PasskeyPrompt } from "./PasskeyPrompt";
import { QrSignInView } from "./QrSignInView";
import { useTokenLogin } from "../viewmodels/useTokenLogin";

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
  /** True when rendered on the platform login surface (no tenant scope). */
  isPlatformMode?: boolean;
}

export function LoginFormRouter({
  vm,
  sso,
  tenantId,
  slotConfig,
  a11y,
  isRTL,
  safeModeActive,
  isPlatformMode = false,
}: LoginFormRouterProps) {
  const { t } = useI18n();
  const { completeTokenLogin } = useTokenLogin();

  return (
    <div
      id="login-main-content"
      className="mx-auto w-full"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
      {...(a11y.ariaLandmarks ? { role: "main", "aria-label": t("auth.loginFormAriaLabel") } : {})}
    >
      {/* Safe-mode notice */}
      {safeModeActive && (
        <div
          className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-600 dark:text-amber-400"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("auth.branding.safeModeActive")}
        </div>
      )}

      <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-6" />

      {/* ── Step router ─────────────────────────────────── */}
      {vm.loginStep === "workspace-selection" ? (
        <PostCredentialWorkspaceSelector
          email={vm.formData.identifier}
          workspaces={vm.availableWorkspaces}
          onSelect={vm.selectWorkspace}
          onUnlock={vm.unlockWorkspace}
          onBack={vm.goBackToCredentials}
          isLoading={vm.isLoading}
          error={vm.error}
        />
      ) : vm.loginStep === "magic-link-request" ? (
        <MagicLinkRequestForm
          isLoading={vm.isMagicLinkSending}
          error={vm.error}
          onBack={vm.goBackToCredentials}
          onSubmit={(email) => vm.requestMagicLink(email, tenantId ?? undefined)}
          isRTL={isRTL}
        />
      ) : vm.loginStep === "magic-link-sent" ? (
        <MagicLinkSentScreen
          email={vm.magicLinkEmail}
          onBack={vm.resetMagicLink}
          onResend={vm.resendMagicLink}
          isRTL={isRTL}
        />
      ) : vm.loginStep === "credentials" ? (
        <>
          <CredentialsForm
            formData={vm.formData}
            showPassword={vm.showPassword}
            isLoading={vm.isLoading}
            isFormValid={vm.isFormValid}
            error={vm.error}
            shakeKey={vm.shakeKey}
            isRTL={isRTL}
            isPlatformMode={isPlatformMode}
            updateField={vm.updateField}
            togglePasswordVisibility={vm.togglePasswordVisibility}
            handleLogin={() => vm.handleLogin(tenantId ?? undefined)}
            errorAnnounce={a11y.errorAnnounce}
            onMagicLinkRequest={() => vm.setLoginStep("magic-link-request")}
            onSwitchToPasskey={() => vm.setLoginStep("passkey")}
            onSwitchToPhoneOtp={() => vm.setLoginStep("phone-otp")}
            onSwitchToQrLogin={() => vm.setLoginStep("qr-login")}
          />
          <SsoProviderButtons
            providers={sso.providers}
            isLoading={sso.isLoading}
            error={sso.error}
            onProviderClick={sso.initiateSsoLogin}
          />
        </>
      ) : vm.loginStep === "phone-otp" ? (
        <PhoneOtpForm
          onSuccess={(result) => {
            completeTokenLogin(result);
          }}
          onBack={vm.goBackToCredentials}
          isRTL={isRTL}
        />
      ) : vm.loginStep === "passkey" ? (
        <PasskeyPrompt
          onSuccess={(result) => {
            completeTokenLogin(result);
          }}
          onBack={vm.goBackToCredentials}
          isRTL={isRTL}
          tenantId={tenantId}
        />
      ) : vm.loginStep === "qr-login" ? (
        <QrSignInView
          onSuccess={(result) => {
            completeTokenLogin(result);
          }}
          onBack={vm.goBackToCredentials}
          isRTL={isRTL}
        />
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
