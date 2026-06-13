"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import { Button } from "@core/ui/button";
import { RotateCcw, RefreshCw, PlayCircle } from "lucide-react";
import type { ResumeSessionResult } from "../../domain/entities";

interface ResumeSignupModalProps {
  info: ResumeSessionResult;
  onResume: () => void;
  onChangePlan: () => void;
  onStartFresh: () => Promise<void>;
}

/**
 * ResumeSignupModal — shown when the user returns to /signup with a pending
 * signupRef in sessionStorage. Lets them:
 *   • Resume  — restore wizard state and jump to Review
 *   • Change plan  — restore wizard data and jump to Plan picker
 *   • Start fresh  — abandon the pending session and start over
 */
export function ResumeSignupModal({
  info,
  onResume,
  onChangePlan,
  onStartFresh,
}: ResumeSignupModalProps) {
  const { t, direction } = useI18n();

  const planLabel = info.billingCycle
    ? info.billingCycle === "yearly"
      ? t("signup.billing.yearly") || "Yearly"
      : t("signup.billing.monthly") || "Monthly"
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={direction}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: BRAND_TOKENS.bg.card,
          border: BRAND_TOKENS.border.card,
          boxShadow: BRAND_TOKENS.shadow.card,
          animation: "sxScreenIn 0.3s ease-out",
        }}
      >
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.25)",
            }}
          >
            <PlayCircle className="h-7 w-7" style={{ color: BRAND_TOKENS.text.brand }} />
          </div>
        </div>

        {/* Heading */}
        <h2
          id="resume-modal-title"
          className="text-center text-xl font-bold"
          style={{ color: BRAND_TOKENS.text.primary }}
        >
          {t("signup.resume.title") || "Welcome back!"}
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
          {t("signup.resume.subtitle") ||
            "You have a signup in progress. What would you like to do?"}
        </p>

        {/* Plan snapshot (if available) */}
        {(planLabel || info.currency) && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-center"
            style={{
              background: "rgba(168,85,247,0.06)",
              border: "1px solid rgba(168,85,247,0.12)",
            }}
          >
            <p className="text-xs" style={{ color: BRAND_TOKENS.text.secondary }}>
              {t("signup.resume.pendingPlan") || "Pending plan"}
            </p>
            <p
              className="mt-0.5 text-sm font-semibold"
              style={{ color: BRAND_TOKENS.text.primary }}
            >
              {[planLabel, info.currency].filter(Boolean).join(" · ")}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            onClick={onResume}
            className="h-11 w-full rounded-xl text-sm font-semibold text-white"
            style={{ background: BRAND_TOKENS.gradient.cta, boxShadow: BRAND_TOKENS.shadow.cta }}
          >
            <PlayCircle className="me-2 h-4 w-4" />
            {t("signup.resume.continue") || "Continue where I left off"}
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={onChangePlan}
            className="h-11 w-full rounded-xl text-sm font-semibold"
            style={{
              borderColor: "rgba(168,85,247,0.3)",
              color: BRAND_TOKENS.text.brand,
            }}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            {t("signup.resume.changePlan") || "Change plan"}
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={onStartFresh}
            className="h-10 w-full rounded-xl text-xs font-medium"
            style={{ color: BRAND_TOKENS.text.tertiary }}
          >
            <RotateCcw className="me-1.5 h-3.5 w-3.5" />
            {t("signup.resume.startFresh") || "Start fresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
