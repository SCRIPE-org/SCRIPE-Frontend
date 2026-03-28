/**
 * ResetPasswordView — Public page for setting a new password
 *
 * Handles the case where a user arrives via a password reset link.
 * Currently the backend does not have self-service password reset endpoints,
 * so this serves as the UI scaffold for when they are implemented.
 *
 * When backend POST /v1/auth/admin/reset-password is added, enable the API call.
 */
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import { ArrowLeft, Lock, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export function ResetPasswordView() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = password.length >= 8 && password === confirmPassword;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: When backend POST /v1/auth/admin/reset-password is implemented,
      // uncomment and call the real endpoint:
      //
      // const response = await fetch("/v1/auth/admin/reset-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, token, newPassword: password }),
      // });
      // if (!response.ok) throw new Error("Failed to reset password");

      // For now, show a "not available" message if no token,
      // or simulate success if token is present (for UI demo purposes)
      if (!token) {
        setError(t("auth.resetNotAvailable") || "Self-service password reset is not yet available. Please contact your administrator.");
        return;
      }

      // Simulate success for UI preview/demo
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || t("auth.resetFailed") || "Failed to reset password. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, token, password, isValid, t]);

  // No token — show instructions to contact admin
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.backToLogin") || "Back to login"}
          </Link>
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {t("auth.invalidResetLink") || "Invalid Reset Link"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("auth.invalidResetLinkDesc") || "This password reset link is invalid or has expired. Please request a new one."}
              </p>
            </div>
            <Link href="/forgot-password">
              <Button className="w-full">
                {t("auth.requestNewLink") || "Request New Link"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToLogin") || "Back to login"}
        </Link>

        {!isSuccess ? (
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("auth.resetPassword") || "Reset Password"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.resetPasswordDesc") || "Enter your new password below."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.newPassword") || "New Password"}</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.newPasswordPlaceholder") || "Enter new password"}
                  required
                  autoFocus
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  {t("auth.passwordMinLength") || "Must be at least 8 characters"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword") || "Confirm Password"}</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("auth.confirmPasswordPlaceholder") || "Confirm new password"}
                  required
                  minLength={8}
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
                className="w-full"
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
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {t("auth.passwordResetSuccess") || "Password Reset"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("auth.passwordResetSuccessDesc") || "Your password has been reset successfully. You can now log in with your new password."}
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push("/login")}>
              {t("auth.goToLogin") || "Go to Login"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
