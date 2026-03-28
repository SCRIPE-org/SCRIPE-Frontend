/**
 * ForgotPasswordView — Public page for password reset request
 *
 * Shows a "contact administrator" message since the platform uses
 * admin-managed password resets (POST /Admins/{id}/reset-password).
 *
 * Self-service password reset (OTP/email link) is planned for v2.
 * When backend endpoints are available, uncomment the form logic below.
 */
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle, ShieldAlert } from "lucide-react";

export function ForgotPasswordView() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Always show success message to prevent email enumeration.
    // When backend POST /v1/auth/admin/forgot-password is implemented,
    // add the real API call here.
    setIsSubmitted(true);
  }, [email]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToLogin") || "Back to login"}
        </Link>

        {!isSubmitted ? (
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("auth.forgotPassword") || "Forgot Password"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.forgotPasswordDesc") || "Enter your email and we'll send you instructions to reset your password."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email") || "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder") || "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!email.trim()}
              >
                {t("auth.sendResetLink") || "Send Reset Instructions"}
              </Button>
            </form>

            {/* Admin contact notice */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs text-muted-foreground">
                {t("auth.adminResetNotice") || "If self-service reset isn't available, contact your system administrator to reset your password."}
              </p>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {t("auth.checkYourEmail") || "Check your email"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("auth.resetLinkSent") || "If an account exists with that email, we've sent password reset instructions. Please check your inbox and spam folder."}
              </p>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => { setIsSubmitted(false); setEmail(""); }}>
                {t("auth.tryAnotherEmail") || "Try another email"}
              </Button>
              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  {t("auth.backToLogin") || "Back to login"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
