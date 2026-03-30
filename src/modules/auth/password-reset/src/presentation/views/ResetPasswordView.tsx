/**
 * ResetPasswordView — Public page for setting a new password
 *
 * Now themed: consumes the same tenant branding tokens as the login page.
 * Uses per-page layout/headline/subtitle from LoginBrandingJson.pages["reset-password"].
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import { ArrowLeft, Lock, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useLoginBrandingTokens } from "@modules/auth/signin/src/presentation/viewmodels/useLoginBrandingTokens";
import { resolveFileUrl } from "@core/common/utils";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "@modules/auth/signin/src/presentation/viewmodels/useTenantResolution";

export function ResetPasswordView() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve tenant branding
  const { branding } = useTenantResolution();

  // Parse branding + inject CSS tokens
  const { layout: rawLayout } = useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  // Get per-page override
  const pageOverride = (() => {
    try {
      if (!branding?.loginBrandingJson) return null;
      const parsed = JSON.parse(branding.loginBrandingJson);
      return parsed.pages?.["reset-password"] ?? null;
    } catch { return null; }
  })();

  const layout = pageOverride?.layout || "centered";

  // Branding values
  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = pageOverride?.headline || t("auth.resetPassword") || "Reset Password";
  const subtitle = pageOverride?.subtitle || t("auth.resetPasswordDesc") || "Enter your new password below.";

  // Dynamic document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  const isValid = password.length >= 8 && password === confirmPassword;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!token) {
        setError(t("auth.resetNotAvailable") || "Self-service password reset is not yet available. Please contact your administrator.");
        return;
      }
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || t("auth.resetFailed") || "Failed to reset password. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, token, password, isValid, t]);

  const wrapperStyle: React.CSSProperties = {
    background: "var(--login-bg-image, none) center/cover no-repeat, var(--login-bg, hsl(var(--background)))",
    lineHeight: "var(--login-line-height, 1.5)",
    letterSpacing: "var(--login-letter-spacing, 0px)",
  };

  // Top actions bar
  const topActions = (
    <div className="absolute left-8 right-8 top-8 flex items-center justify-end gap-1 z-20">
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
  );

  // No token — show invalid link view
  if (!token) {
    return (
      <div
        className="flex min-h-screen w-full flex-col items-center justify-center login-page selection:bg-primary/20"
        dir={direction}
        style={wrapperStyle}
      >
        {topActions}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 w-full max-w-lg">
          <div className="w-full" style={{ maxWidth: "var(--login-form-width, 440px)" }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] hover:text-[var(--login-text,hsl(var(--foreground)))] transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("auth.backToLogin") || "Back to login"}
            </Link>
            <div
              className="border border-[var(--login-border,hsl(var(--border)))] space-y-6 text-center"
              style={{
                borderRadius: "var(--login-radius-card, 16px)",
                padding: "var(--login-card-padding, 32px)",
                backgroundColor: "var(--login-surface, hsl(var(--card)))",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.1))",
              }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h2 className="login-heading" style={{ color: "var(--login-text, hsl(var(--foreground)))", fontSize: "var(--login-size-headline, 1.25rem)" }}>
                  {t("auth.invalidResetLink") || "Invalid Reset Link"}
                </h2>
                <p style={{ color: "var(--login-text-muted, hsl(var(--muted-foreground)))", fontSize: "var(--login-size-subtitle, 0.875rem)" }}>
                  {t("auth.invalidResetLinkDesc") || "This password reset link is invalid or has expired. Please request a new one."}
                </p>
              </div>
              <Link href="/forgot-password">
                <Button className="login-button w-full">
                  {t("auth.requestNewLink") || "Request New Link"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center login-page selection:bg-primary/20"
      dir={direction}
      style={wrapperStyle}
    >
      {topActions}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 w-full max-w-lg">
        <div className="w-full" style={{ maxWidth: "var(--login-form-width, 440px)" }}>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] hover:text-[var(--login-text,hsl(var(--foreground)))] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.backToLogin") || "Back to login"}
          </Link>

          {!isSuccess ? (
            <div
              className="border border-[var(--login-border,hsl(var(--border)))] space-y-6"
              style={{
                borderRadius: "var(--login-radius-card, 16px)",
                padding: "var(--login-card-padding, 32px)",
                backgroundColor: "var(--login-surface, hsl(var(--card)))",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.1))",
              }}
            >
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--login-primary, hsl(var(--primary))) 10%, transparent)" }}>
                  <Lock className="h-6 w-6" style={{ color: "var(--login-primary, hsl(var(--primary)))" }} />
                </div>
                <h1 className="login-heading tracking-tight" style={{ color: "var(--login-text, hsl(var(--foreground)))", fontSize: "var(--login-size-headline, 1.5rem)" }}>
                  {headline}
                </h1>
                <p style={{ color: "var(--login-text-muted, hsl(var(--muted-foreground)))", fontSize: "var(--login-size-subtitle, 0.875rem)" }}>
                  {subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="login-label">{t("auth.newPassword") || "New Password"}</Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.newPasswordPlaceholder") || "Enter new password"}
                    required
                    autoFocus
                    minLength={8}
                    className="login-input"
                  />
                  <p className="text-xs" style={{ color: "var(--login-text-muted, hsl(var(--muted-foreground)))" }}>
                    {t("auth.passwordMinLength") || "Must be at least 8 characters"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="login-label">{t("auth.confirmPassword") || "Confirm Password"}</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.confirmPasswordPlaceholder") || "Confirm new password"}
                    required
                    minLength={8}
                    className="login-input"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">
                      {t("auth.passwordMismatch") || "Passwords do not match"}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="login-button w-full"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading") || "Resetting..."}
                    </>
                  ) : (
                    t("auth.resetPasswordAction") || "Reset Password"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div
              className="border border-[var(--login-border,hsl(var(--border)))] space-y-6 text-center"
              style={{
                borderRadius: "var(--login-radius-card, 16px)",
                padding: "var(--login-card-padding, 32px)",
                backgroundColor: "var(--login-surface, hsl(var(--card)))",
                boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.1))",
              }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="login-heading" style={{ color: "var(--login-text, hsl(var(--foreground)))", fontSize: "var(--login-size-headline, 1.25rem)" }}>
                  {t("auth.passwordResetSuccess") || "Password Reset"}
                </h2>
                <p style={{ color: "var(--login-text-muted, hsl(var(--muted-foreground)))", fontSize: "var(--login-size-subtitle, 0.875rem)" }}>
                  {t("auth.passwordResetSuccessDesc") || "Your password has been reset successfully. You can now log in with your new password."}
                </p>
              </div>
              <Button className="login-button w-full" onClick={() => router.push("/login")}>
                {t("auth.goToLogin") || "Go to Login"}
              </Button>
            </div>
          )}
        </div>
        <p className="mt-12 text-[11px] font-medium text-[var(--login-text-muted,hsl(var(--muted-foreground)))]/50">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </div>
  );
}
