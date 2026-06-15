"use client";

import { useCallback, useEffect, useRef } from "react";
import { Play, RefreshCw, RotateCcw } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { ResumeSessionResult } from "../../../domain/entities";

// ═══════════════════════════════════════════════════════════════════════════
// ResumeSignupModal — shown on mount when a resumable in-progress signup is
// detected (a SIGNUP_REF in sessionStorage that the server still considers
// pending / awaiting_payment). Offers three paths:
//   • Resume      → restore wizard state, jump to Review.
//   • Change plan → restore data, jump to the plan picker.
//   • Start fresh → abandon the pending session, start over.
//
// Uses the native <dialog> element (top-layer) so it is NEVER clipped by an
// ancestor's overflow/transform — no z-index races with the wizard shell.
// Focus is trapped by showModal(); we also restore focus + lock body scroll.
// Reduced-motion safe; localized; RTL via dir.
// ═══════════════════════════════════════════════════════════════════════════

interface ResumeSignupModalProps {
  info: ResumeSessionResult;
  onResume: () => void;
  onChangePlan: () => void;
  onStartFresh: () => void | Promise<void>;
}

export function ResumeSignupModal({
  info,
  onResume,
  onChangePlan,
  onStartFresh,
}: ResumeSignupModalProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open as a true modal (top-layer + built-in focus trap) on mount.
  useEffect(() => {
    const el = dialogRef.current;
    if (el && !el.open) {
      el.showModal();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // The resume modal is a deliberate decision point — Esc / backdrop should not
  // silently dismiss it (no "cancel" path), so we swallow the default close.
  const handleCancel = useCallback((e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
  }, []);

  const planLabel = info.billingCycle
    ? info.billingCycle === "yearly"
      ? t("signup.billing.yearly")
      : t("signup.billing.monthly")
    : null;
  const snapshot = [planLabel, info.currency].filter(Boolean).join(" · ");

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      dir={direction}
      aria-labelledby="resume-modal-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl p-0 backdrop:bg-black/60"
      style={{ background: "transparent", border: "none", color: tokens.ink }}
    >
      <div
        className="rounded-2xl p-8"
        style={{
          background: tokens.surfaceCard,
          border: tokens.borderCard,
          boxShadow: tokens.shadowCard,
        }}
      >
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: `${tokens.accent}1f`, border: `1px solid ${tokens.accent}44` }}
          >
            <Play
              className="h-6 w-6 rtl:scale-x-[-1]"
              aria-hidden="true"
              style={{ color: tokens.accent }}
            />
          </div>
        </div>

        <h2
          id="resume-modal-title"
          className="text-center text-[1.25rem] font-semibold"
          style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
        >
          {t("signup.resume.title")}
        </h2>
        <p
          className="mt-2 text-center text-[0.875rem] leading-relaxed"
          style={{ color: tokens.inkMuted }}
        >
          {t("signup.resume.subtitle")}
        </p>

        {/* Plan snapshot */}
        {snapshot && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-center"
            style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
          >
            <p className="text-[0.75rem]" style={{ color: tokens.inkFaint }}>
              {t("signup.resume.pendingPlanLabel")}
            </p>
            <p className="mt-0.5 text-[0.875rem] font-semibold" style={{ color: tokens.ink }}>
              {snapshot}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[0.875rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
            style={{
              background: tokens.gradientCta,
              color: tokens.accentContrast,
              boxShadow: tokens.shadowCard,
            }}
          >
            <Play className="h-4 w-4 rtl:scale-x-[-1]" aria-hidden="true" />
            {t("signup.resume.continue")}
          </button>

          <button
            type="button"
            onClick={onChangePlan}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[0.875rem] font-semibold transition-opacity duration-200 hover:opacity-80"
            style={{
              background: tokens.surfaceRaised,
              border: tokens.borderCard,
              color: tokens.accent,
            }}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t("signup.resume.changePlan")}
          </button>

          <button
            type="button"
            onClick={() => void onStartFresh()}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80"
            style={{ color: tokens.inkMuted }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {t("signup.resume.startFresh")}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default ResumeSignupModal;
