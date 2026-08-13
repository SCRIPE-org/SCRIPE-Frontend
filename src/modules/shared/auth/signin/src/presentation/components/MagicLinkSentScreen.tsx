"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@core/ui/button";

interface MagicLinkSentScreenProps {
  email: string;
  onBack: () => void;
  onResend: (email: string) => Promise<void>;
  isRTL: boolean;
}

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Presentation UI component rendering the magic link sent screen.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function MagicLinkSentScreen({ email, onBack, onResend, isRTL }: MagicLinkSentScreenProps) {
  const { t } = useI18n();
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setResendError("");
    try {
      await onResend(email);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      intervalRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      setResendError(t("auth.connectionError"));
    } finally {
      setIsResending(false);
    }
  }, [countdown, isResending, onResend, email, t]);

  const resendLabel =
    countdown > 0
      ? t("auth.magicLink.resendCooldown").replace("{{seconds}}", String(countdown))
      : isResending
        ? t("auth.magicLink.resending")
        : t("auth.magicLink.resend");

  return (
    <div className="sx-rise flex flex-col gap-6 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "var(--sx-accent-soft, rgba(198,255,0,.1))",
            border: "1px solid var(--sx-accent-soft-border, rgba(198,255,0,.3))",
          }}
        >
          <Mail
            className="h-7 w-7"
            style={{ color: "var(--sx-accent-text, hsl(var(--primary)))" }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-1.5">
        <h2
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text, hsl(var(--foreground)))" }}
        >
          {t("auth.magicLink.sentTitle")}
        </h2>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
        >
          {t("auth.magicLink.sentDesc")}
        </p>
        {/* Show the email it was sent to */}
        <p
          className="mt-1 text-[13px] font-medium"
          style={{ color: "var(--sx-accent-text, hsl(var(--primary)))" }}
        >
          {email}
        </p>
      </div>

      {/* Resend error */}
      {resendError && (
        <div
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5"
          role="alert"
        >
          <p className="text-[13px] text-destructive">{resendError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-[14px] font-medium shadow-none transition-all disabled:opacity-50"
          style={{
            background: "var(--sx-chip-bg, rgba(255,255,255,.03))",
            borderColor: "var(--sx-chip-border, rgba(255,255,255,.08))",
            color: "var(--sx-text, hsl(var(--foreground)))",
          }}
          variant="outline"
        >
          {isResending ? (
            <span
              className="sx-spin1 inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          {resendLabel}
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 py-2 text-[13px] font-medium transition-colors"
          style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
        >
          {isRTL ? null : <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />}
          {t("auth.magicLink.backToLogin")}
          {isRTL ? <ArrowLeft className="h-3.5 w-3.5 rotate-180" aria-hidden="true" /> : null}
        </Button>
      </div>
    </div>
  );
}
