/**
 * SsoOnlyCredentialsPanel — SSO-First Sign-In Surface with Optional Audited Break-Glass Fallback
 *
 * Rendered on the workspace login page when `PublicTenantBrandingDto.authenticationMode`
 * is `"SsoOnly"`. Emphasizes configured SSO identity providers and hides standard local
 * password login by default, revealing an audited Break-Glass form only when enabled by
 * tenant policy (`allowOwnerBreakGlassLocalLogin`).
 *
 * @module auth/signin/presentation/components
 */
"use client";

import { ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { SsoProvider } from "@modules/auth/core/domain/entities/SsoProvider";
import type { LoginFormData } from "../types/loginTypes";
import { CredentialsFormHeader } from "./CredentialsFormHeader";
import { CredentialsErrorAlert } from "./CredentialsErrorAlert";
import { IdentifierInput } from "./IdentifierInput";
import { CredentialsPasswordInput } from "./CredentialsPasswordInput";
import { SsoProviderButtons } from "./SsoProviderButtons";

interface SsoOnlyCredentialsPanelProps {
  formData: LoginFormData;
  showPassword: boolean;
  isLoading: boolean;
  isFormValid: boolean;
  error: string;
  shakeKey: number;
  isRTL: boolean;
  errorAnnounce?: boolean;
  allowOwnerBreakGlassLocalLogin: boolean;
  isBreakGlassExpanded: boolean;
  onToggleBreakGlass: () => void;
  updateField: (field: keyof LoginFormData, value: string | boolean) => void;
  togglePasswordVisibility: () => void;
  handleBreakGlassLogin: () => void;
  providers: SsoProvider[];
  isProvidersLoading: boolean;
  ssoError: string | null;
  discoveryError?: string | null;
  onRetryProviders?: () => void;
  onProviderClick: (providerId: string, protocol?: string) => void;
}

/**
 * Renders the SSO-enforced sign-in screen with an optional collapsible Break-Glass local login.
 */
export function SsoOnlyCredentialsPanel({
  formData,
  showPassword,
  isLoading,
  isFormValid,
  error,
  shakeKey,
  isRTL,
  errorAnnounce = true,
  allowOwnerBreakGlassLocalLogin,
  isBreakGlassExpanded,
  onToggleBreakGlass,
  updateField,
  togglePasswordVisibility,
  handleBreakGlassLogin,
  providers,
  isProvidersLoading,
  ssoError,
  discoveryError = null,
  onRetryProviders,
  onProviderClick,
}: SsoOnlyCredentialsPanelProps) {
  const { t } = useI18n();
  const arrow = isRTL ? "←" : "→";

  return (
    <div className="flex flex-col gap-[var(--login-gap,16px)]" data-testid="sso-only-login-panel">
      <CredentialsFormHeader t={t} />

      <Alert variant="info" className="rounded-xl">
        <ShieldCheck aria-hidden="true" />
        <AlertTitle>{t("auth.ssoOnly.title")}</AlertTitle>
        <AlertDescription>{t("auth.ssoOnly.subtitle")}</AlertDescription>
      </Alert>

      <SsoProviderButtons
        providers={providers}
        isLoading={isProvidersLoading}
        error={ssoError}
        discoveryError={discoveryError}
        onRetryProviders={onRetryProviders}
        onProviderClick={onProviderClick}
        hideDivider={true}
      />

      {!isProvidersLoading && providers.length === 0 && !ssoError && !discoveryError && (
        <Alert variant="warning" className="rounded-xl">
          <ShieldAlert aria-hidden="true" />
          <AlertDescription>{t("auth.ssoOnly.noProvidersWarning")}</AlertDescription>
        </Alert>
      )}

      {allowOwnerBreakGlassLocalLogin ? (
        <div className="mt-2 border-t pt-4" style={{ borderColor: "var(--sx-divider, hsl(var(--border)))" }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="break-glass-toggle"
            aria-expanded={isBreakGlassExpanded}
            onClick={onToggleBreakGlass}
            className="h-auto w-full justify-between px-2 py-1.5 text-xs font-medium text-nx-ink-2 hover:text-nx-ink"
          >
            <span>{t("auth.ssoOnly.breakGlassToggle")}</span>
            {isBreakGlassExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
          </Button>

          {isBreakGlassExpanded && (
            <form
              data-testid="break-glass-login-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isLoading && isFormValid) handleBreakGlassLogin();
              }}
              className="mt-3 flex flex-col gap-3.5 rounded-xl border border-warning-strong/30 bg-warning/10 p-4"
              aria-label={t("auth.ssoOnly.breakGlassToggle")}
              noValidate
            >
              <Alert variant="warning">
                <ShieldAlert aria-hidden="true" />
                <AlertTitle>{t("auth.ssoOnly.breakGlassWarningTitle")}</AlertTitle>
                <AlertDescription>{t("auth.ssoOnly.breakGlassWarningDesc")}</AlertDescription>
              </Alert>

              {error && (
                <CredentialsErrorAlert
                  error={error}
                  shakeKey={shakeKey}
                  errorAnnounce={errorAnnounce}
                  t={t}
                />
              )}

              <IdentifierInput
                value={formData.identifier}
                onChange={(val) => updateField("identifier", val)}
                disabled={isLoading}
                hasError={!!error}
                t={t}
              />

              <CredentialsPasswordInput
                value={formData.password}
                onChange={(val) => updateField("password", val)}
                showPassword={showPassword}
                onToggleShowPassword={togglePasswordVisibility}
                disabled={isLoading}
                hasError={!!error}
                t={t}
              />

              <div className="flex items-center gap-2">
                <Checkbox
                  id="break-glass-stay-signed-in"
                  checked={formData.staySignedIn}
                  onCheckedChange={(checked) => updateField("staySignedIn", checked === true)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="break-glass-stay-signed-in"
                  className="cursor-pointer text-xs text-nx-ink-2"
                >
                  {t("auth.staySignedIn")}
                </Label>
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                variant="destructive"
                className="h-11 w-full rounded-xl text-sm font-semibold"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="inline" showText={false} />
                    {t("auth.signingIn")}
                  </>
                ) : (
                  <>
                    {t("auth.ssoOnly.breakGlassSubmit")} {arrow}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      ) : (
        <p className="mt-2 text-center text-xs" style={{ color: "var(--sx-text-faint)" }}>
          {t("auth.ssoOnly.localDisabledNotice")}
        </p>
      )}
    </div>
  );
}
