"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";

interface MagicLinkRequestFormProps {
  isLoading: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (email: string) => void;
  isRTL: boolean;
}

/**
 * React presentation component representing the magic link request form UI element.
 */
export function MagicLinkRequestForm({
  isLoading,
  error,
  onBack,
  onSubmit,
  isRTL,
}: MagicLinkRequestFormProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !isLoading) {
      onSubmit(email.trim());
    }
  };

  return (
    <div className="sx-screen-anim w-full space-y-5" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--sx-text, rgba(245,242,255,0.95))" }}
        >
          {t("auth.magicLink.title") || "Sign in with magic link"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.magicLink.description") ||
            "Enter your email address and we will send you a sign-in link."}
        </p>
      </div>

      {error && (
        <div
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">
            {error.startsWith("auth.") ? t(error as any) : error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-2">
          <Label
            htmlFor="magic-link-email"
            className="text-sm font-medium"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.email") || "Email Address"}
          </Label>
          <Input
            id="magic-link-email"
            type="email"
            placeholder={t("auth.emailPlaceholder") || "you@example.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isLoading}
            className="h-11 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--sx-text)",
            }}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="relative w-full overflow-hidden rounded-lg py-3 text-sm font-semibold"
          style={{
            background: "var(--sx-cta-gradient)",
            color: "#fff",
            boxShadow: "var(--sx-cta-shadow)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="inline" showText={false} />
              {t("common.loading") || "Sending…"}
            </span>
          ) : (
            t("auth.magicLink.signInWithLink") || "Email me a sign-in link"
          )}
        </Button>
      </form>

      {/* Back */}
      <Button
        variant="link"
        onClick={onBack}
        disabled={isLoading}
        className="mx-auto block text-sm font-medium underline underline-offset-2"
        style={{ color: "var(--sx-accent-text)" }}
      >
        {t("auth.passkey.otherMethods") || "Use another sign-in method"}
      </Button>
    </div>
  );
}
