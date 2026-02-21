"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound, BookOpen } from "lucide-react";
import { Logo } from "@core/ui/logo";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { useLoginViewModel } from "../viewmodels/use-login-viewmodel";
import Link from "next/link";

export function LoginView() {
  const { t, language } = useI18n();
  const vm = useLoginViewModel();
  const isRTL = language === "ar";
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

  // Show loading spinner while redirecting or not hydrated.
  // IMPORTANT: With in-memory tokens, isAuthenticated from Zustand persist may be stale
  // (true after page reload but token is gone). Only show redirect spinner when ACTIVELY
  // redirecting (vm.isRedirecting is set by checkAndRedirect only when hasToken() is true).
  if (!vm.hasHydrated || vm.isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="text-center">
          <LoadingSpinner size="md" showText={false} />
          <p className="mt-4 text-muted-foreground">{t("auth.redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      {/* Background Pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>

      {/* Docs Link - Top Left */}
      <div className="absolute left-4 top-4">
        <Button variant="outline" className="glass bg-transparent gap-2 border-primary/20 hover:bg-primary/10" asChild>
          <Link href="/docs">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline-block">Docs</span>
          </Link>
        </Button>
      </div>

      {/* Language and Theme Switchers - Top Right */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher buttonClassName="glass bg-transparent border-primary/20 hover:bg-primary/10" />
        <ThemeSwitcher buttonClassName="glass bg-transparent border-primary/20 hover:bg-primary/10" />
      </div>

      <Card className="glass hover-lift animate-fade-in w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <Logo size="xl" animation="fancy" />
          </div>

          {vm.loginStep === "credentials" ? (
            <div>
              <h1 className="text-2xl font-bold">{t("auth.welcome")}</h1>
              <p className="mt-2 text-muted-foreground">{t("auth.pleaseLogin")}</p>
            </div>
          ) : (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary duration-500 animate-in zoom-in-50" />
              </div>
              <h1 className="text-2xl font-bold">{t("auth.twoFactor.title")}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
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
                    className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl hover:bg-muted/50`}
                    onClick={vm.togglePasswordVisibility}
                    disabled={vm.isLoading}
                  >
                    {vm.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="gradient-primary h-12 w-full"
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
                <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive duration-300 animate-in slide-in-from-top-2">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-destructive/20">
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
                    className="h-14 border-2 text-center font-mono text-lg tracking-[0.3em] transition-colors focus:border-primary/50"
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
                      <InputOTPSlot
                        index={0}
                        className="h-14 w-12 rounded-xl border-2 text-xl font-semibold transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-14 w-12 rounded-xl border-2 text-xl font-semibold transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-14 w-12 rounded-xl border-2 text-xl font-semibold transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                      />
                    </InputOTPGroup>
                    <span className="mx-1 text-xl font-light text-muted-foreground/50">–</span>
                    <InputOTPGroup className="gap-1.5">
                      <InputOTPSlot
                        index={3}
                        className="h-14 w-12 rounded-xl border-2 text-xl font-semibold transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-14 w-12 rounded-xl border-2 text-xl font-semibold transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-14 w-12 rounded-xl border-2 text-xl font-semibold transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}

              <Button
                type="button"
                className="gradient-primary h-12 w-full text-base font-medium shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
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
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={vm.toggleBackupCode}
                >
                  <KeyRound className="me-2 h-3.5 w-3.5" />
                  {vm.useBackupCode
                    ? t("auth.twoFactor.useAuthenticator")
                    : t("auth.twoFactor.useBackupCode")}
                </Button>

                {/* Back button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
                  onClick={vm.goBackToCredentials}
                  disabled={vm.isVerifying2FA}
                >
                  <ArrowLeft className="me-1.5 h-3 w-3" />
                  {t("auth.twoFactor.backToLogin")}
                </Button>
              </div>
            </div>
          )}

          {/* Debug Section */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>API URL: {process.env.NEXT_PUBLIC_API_URL || "Not set - using default"}</p>
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
