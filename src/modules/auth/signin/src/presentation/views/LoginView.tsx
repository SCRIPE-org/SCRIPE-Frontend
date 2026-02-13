"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { Logo } from "@core/ui/logo";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { useLoginViewModel } from "../viewmodels/use-login-viewmodel";

export function LoginView() {
  const { t, language } = useI18n();
  const vm = useLoginViewModel();
  const isRTL = language === 'ar';
  const hasCheckedAuth = useRef(false);

  // Check for authenticated user ONCE after hydration
  useEffect(() => {
    // Only check once
    if (hasCheckedAuth.current) return;

    // Wait for hydration
    if (!vm.hasHydrated) return;

    // Mark as checked
    hasCheckedAuth.current = true;

    // Redirect if already authenticated
    vm.checkAndRedirect();
  }, [vm.hasHydrated, vm.checkAndRedirect]);

  // Show loading spinner while redirecting or not hydrated
  if (!vm.hasHydrated || vm.isRedirecting || (vm.isAuthenticated && !vm.isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="text-center">
          <LoadingSpinner size="md" showText={false} />
          <p className="mt-4 text-muted-foreground">{t("auth.redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Language and Theme Switchers */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher buttonClassName="glass bg-transparent" />
        <ThemeSwitcher buttonClassName="glass bg-transparent" />
      </div>

      <Card className="w-full max-w-md glass hover-lift animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <Logo size="xl" animation="fancy" />
          </div>

          {vm.loginStep === "credentials" ? (
            <div>
              <h1 className="text-2xl font-bold">{t("auth.welcome")}</h1>
              <p className="text-muted-foreground mt-2">
                {t("auth.pleaseLogin")}
              </p>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center mb-4 shadow-lg shadow-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary animate-in zoom-in-50 duration-500" />
              </div>
              <h1 className="text-2xl font-bold">{t("auth.twoFactor.title")}</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {vm.useBackupCode
                  ? t("auth.twoFactor.enterBackupCode")
                  : t("auth.twoFactor.enterAuthCode")}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Step 1: Credentials Form */}
          {vm.loginStep === "credentials" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!vm.isLoading && vm.isFormValid) {
                  vm.handleLogin();
                }
              }}
              className="space-y-6"
            >
              {vm.error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {vm.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">{t("auth.username")}</Label>
                <Input
                  id="username"
                  type="text"
                  value={vm.formData.username}
                  onChange={(e) => vm.updateField("username", e.target.value)}
                  required
                  className="h-12"
                  placeholder={t("auth.usernamePlaceholder")}
                  disabled={vm.isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={vm.showPassword ? "text" : "password"}
                    value={vm.formData.password}
                    onChange={(e) => vm.updateField("password", e.target.value)}
                    required
                    className="h-12 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    placeholder="••••••••"
                    disabled={vm.isLoading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50 rounded-xl`}
                    onClick={vm.togglePasswordVisibility}
                    disabled={vm.isLoading}
                  >
                    {vm.showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 gradient-primary"
                disabled={vm.isLoading || !vm.isFormValid}
              >
                {vm.isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="inline" showText={false} />
                    <span>{t("common.loading")}</span>
                  </div>
                ) : (
                  t("auth.loginButton")
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Two-Factor Authentication */}
          {vm.loginStep === "two-factor" && (
            <div className="space-y-6">
              {vm.error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300">
                  <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">!</span>
                  </div>
                  <span>{vm.error}</span>
                </div>
              )}

              {vm.useBackupCode ? (
                /* Backup Code Input */
                <div className="space-y-3">
                  <Label htmlFor="backup-code" className="text-sm font-medium">
                    {t("auth.twoFactor.backupCode")}
                  </Label>
                  <Input
                    id="backup-code"
                    type="text"
                    value={vm.twoFactorCode}
                    onChange={(e) => vm.setTwoFactorCode(e.target.value)}
                    placeholder="XXXX-XXXX"
                    className="h-14 text-center text-lg font-mono tracking-[0.3em] border-2 focus:border-primary/50 transition-colors"
                    style={{ direction: "ltr" }}
                    disabled={vm.isVerifying2FA}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && vm.twoFactorCode.trim()) {
                        vm.handleVerify2FA();
                      }
                    }}
                  />
                </div>
              ) : (
                /* TOTP Code Input — always LTR */
                <div className="flex flex-col items-center gap-2" dir="ltr">
                  <InputOTP
                    maxLength={6}
                    value={vm.twoFactorCode}
                    onChange={vm.setTwoFactorCode}
                    disabled={vm.isVerifying2FA}
                    onComplete={vm.handleVerify2FA}
                    className="gap-2"
                  >
                    <InputOTPGroup className="gap-1.5">
                      <InputOTPSlot index={0} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={1} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={2} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                    </InputOTPGroup>
                    <span className="text-xl font-light text-muted-foreground/50 mx-1">–</span>
                    <InputOTPGroup className="gap-1.5">
                      <InputOTPSlot index={3} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={4} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                      <InputOTPSlot index={5} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}

              <Button
                type="button"
                className="w-full h-12 gradient-primary text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                disabled={vm.isVerifying2FA || !vm.twoFactorCode.trim()}
                onClick={vm.handleVerify2FA}
              >
                {vm.isVerifying2FA ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="inline" showText={false} />
                    <span>{t("auth.twoFactor.verifying")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span>{t("auth.twoFactor.verify")}</span>
                  </div>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
              </div>

              {/* Toggle between TOTP and backup code */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={vm.toggleBackupCode}
                >
                  <KeyRound className="h-3.5 w-3.5 me-2" />
                  {vm.useBackupCode
                    ? t("auth.twoFactor.useAuthenticator")
                    : t("auth.twoFactor.useBackupCode")}
                </Button>

                {/* Back button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
                  onClick={vm.goBackToCredentials}
                  disabled={vm.isVerifying2FA}
                >
                  <ArrowLeft className="h-3 w-3 me-1.5" />
                  {t("auth.twoFactor.backToLogin")}
                </Button>
              </div>
            </div>
          )}

          {/* Debug Section */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>
                API URL:{" "}
                {process.env.NEXT_PUBLIC_API_URL || "Not set - using default"}
              </p>
              <p>Hydrated: {vm.hasHydrated ? "Yes" : "No"}</p>
              <p>Authenticated: {vm.isAuthenticated ? "Yes" : "No"}</p>
              <p>Login Step: {vm.loginStep}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginView;
