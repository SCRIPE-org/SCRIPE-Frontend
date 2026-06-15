"use client";

import { useCallback } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2, Lock, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { BRAND } from "@core/config/branding";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { SUBDOMAIN_MIN_LENGTH } from "../../../domain/constants/signupConstants";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";

// ═══════════════════════════════════════════════════════════════════════════
// WorkspaceStep — the workspace phase (F7). Organization name + a subdomain
// field with LIVE, debounced availability, a real-time `name.<domain>` preview,
// and available / taken / reserved / invalid / checking states. The optional
// admin username mirrors the legacy field. Continue is enabled only on a valid,
// available subdomain.
//
// Product-register calm: solid-ink heading (no gradient text), restrained
// surfaces, accent reserved for the primary action + the live URL preview's
// subdomain token. Reduced-motion safe; RTL-aware (the URL preview stays LTR).
//
// Dumb UI: availability + submit come from the wizard (which composes the proven
// useSignupSubdomain hook — same debounce + fail-open semantics). The wizard
// advances to `review` once the subdomain is available and the email token is set.
// ═══════════════════════════════════════════════════════════════════════════

type SubdomainStatus = "idle" | "checking" | "available" | "unavailable";

interface WorkspaceStepProps {
  wizard: SignupWizardViewModel;
}

export function WorkspaceStep({ wizard }: WorkspaceStepProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const { wizardData, subdomainResult, isCheckingSubdomain, updateField } = wizard;

  // Auto-derive a subdomain candidate from the org name and check it.
  const handleNameChange = useCallback(
    (name: string) => {
      updateField("workspaceName", name);
      const auto = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 63);
      if (auto) wizard.checkSubdomain(auto);
    },
    [updateField, wizard],
  );

  const status: SubdomainStatus = isCheckingSubdomain
    ? "checking"
    : !subdomainResult
      ? "idle"
      : subdomainResult.available
        ? "available"
        : "unavailable";

  const statusBorder =
    status === "available"
      ? tokens.success
      : status === "unavailable"
        ? tokens.error
        : tokens.border;

  const canContinue =
    !wizard.isSubmitting &&
    wizardData.workspaceName.trim().length >= 2 &&
    wizardData.subdomain.length >= SUBDOMAIN_MIN_LENGTH &&
    status === "available";

  const inputStyle = {
    background: tokens.surfaceRaised,
    borderColor: tokens.border,
    color: tokens.ink,
  } as const;

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-10 sm:px-8 sm:py-14" dir={direction}>
      {/* ── Heading ── */}
      <header className="mb-7 flex flex-col gap-2">
        <h1
          className="font-semibold"
          style={{
            color: tokens.ink,
            fontSize: "clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {t("signup.workspace.title")}
        </h1>
        <p className="text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {t("signup.workspace.subtitle")}
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          wizard.submitWorkspace();
        }}
        className="flex flex-col gap-5"
        noValidate
      >
        {/* ── Organization name ── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-workspace" className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
            {t("signup.workspace.orgName")}
          </Label>
          <Input
            id="signup-workspace"
            type="text"
            autoFocus
            placeholder={t("signup.workspace.orgNamePlaceholder")}
            value={wizardData.workspaceName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="h-11"
            style={inputStyle}
          />
        </div>

        {/* ── Subdomain ── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-subdomain" className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
            {t("signup.workspace.workspaceUrl")}
          </Label>
          <div className="flex items-stretch" dir="ltr">
            <div className="relative flex-1">
              <Input
                id="signup-subdomain"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder={t("signup.workspace.subdomainPlaceholder")}
                value={wizardData.subdomain}
                onChange={(e) => wizard.checkSubdomain(e.target.value.toLowerCase())}
                aria-describedby="signup-subdomain-status"
                aria-invalid={status === "unavailable"}
                className="h-11 rounded-r-none pr-9"
                style={{ ...inputStyle, borderColor: statusBorder, transition: "border-color 0.15s" }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {status === "checking" && (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" style={{ color: tokens.inkFaint }} />
                )}
                {status === "available" && <Check className="h-4 w-4" aria-hidden="true" style={{ color: tokens.success }} />}
                {status === "unavailable" && <X className="h-4 w-4" aria-hidden="true" style={{ color: tokens.error }} />}
              </span>
            </div>
            <span
              className="inline-flex h-11 items-center rounded-r-xl border border-l-0 px-3 text-[0.8125rem] font-medium"
              style={{ background: tokens.surfaceRaised, borderColor: tokens.border, color: tokens.inkFaint }}
            >
              .{BRAND.domain}
            </span>
          </div>

          {/* Status message — announced to assistive tech */}
          <div id="signup-subdomain-status" aria-live="polite" className="min-h-[1rem]">
            {status === "unavailable" && subdomainResult && (
              <p role="alert" className="text-[0.75rem] font-medium" style={{ color: tokens.error }}>
                {subdomainResult.reason === "taken"
                  ? t("signup.workspace.subdomainTaken")
                  : subdomainResult.reason === "reserved"
                    ? t("signup.workspace.subdomainReserved")
                    : t("signup.workspace.subdomainInvalid")}
                {subdomainResult.suggestion && (
                  <button
                    type="button"
                    onClick={() => wizard.checkSubdomain(subdomainResult.suggestion!)}
                    className="mx-1 font-medium underline underline-offset-2 hover:no-underline"
                    style={{ color: tokens.accent }}
                  >
                    {t("signup.workspace.trySuggestion", { suggestion: subdomainResult.suggestion })}
                  </button>
                )}
              </p>
            )}
            {status === "available" && wizardData.subdomain && (
              <p className="text-[0.75rem] font-medium" style={{ color: tokens.success }}>
                {t("signup.workspace.subdomainAvailableShort")}
              </p>
            )}
          </div>

          {/* Live URL preview — calm address pill, stays LTR in RTL */}
          {wizardData.subdomain && (
            <div
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
              dir="ltr"
              aria-label={t("signup.workspace.previewLabel", {
                url: `${wizardData.subdomain}.${BRAND.domain}`,
              })}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" style={{ color: tokens.inkFaint }} />
              <span className="truncate text-[0.8125rem]">
                <span className="font-semibold" style={{ color: tokens.accent }}>
                  {wizardData.subdomain}
                </span>
                <span style={{ color: tokens.inkMuted }}>.{BRAND.domain}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Admin username (optional) ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="signup-username" className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
              {t("signup.workspace.adminUsername")}
            </Label>
            <span className="text-[0.6875rem]" style={{ color: tokens.inkFaint }}>
              {t("signup.common.optional")}
            </span>
          </div>
          <Input
            id="signup-username"
            type="text"
            autoComplete="username"
            placeholder={t("signup.workspace.adminUsernamePlaceholder")}
            value={wizardData.username}
            onChange={(e) => updateField("username", e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            className="h-11"
            style={inputStyle}
          />
        </div>

        {/* ── Flow error ── */}
        {wizard.error && (
          <div
            role="alert"
            className="rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium"
            style={{ background: `${tokens.error}1a`, border: `1px solid ${tokens.error}40`, color: tokens.error }}
          >
            {wizard.error}
          </div>
        )}

        {/* ── Primary CTA ── */}
        <button
          type="submit"
          disabled={!canContinue}
          aria-busy={wizard.isSubmitting}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transform-none"
          style={{ background: tokens.gradientCta, color: tokens.accentContrast, boxShadow: tokens.shadowCard }}
        >
          {wizard.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              <span className="sr-only">{t("signup.common.loading")}</span>
            </>
          ) : (
            <>
              {t("signup.workspace.continue")}
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:scale-x-[-1] motion-reduce:transform-none"
              />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={wizard.back}
          disabled={wizard.isSubmitting}
          className="mx-auto inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
          style={{ color: tokens.inkMuted }}
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
          {t("signup.workspace.back")}
        </button>
      </form>
    </div>
  );
}

export default WorkspaceStep;
