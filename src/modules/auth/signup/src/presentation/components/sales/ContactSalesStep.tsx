// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { Input } from "@core/ui/input";
import { PhoneInput, isValidPhoneNumber, type Country } from "@core/ui/phone-input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";

// ═══════════════════════════════════════════════════════════════════════════
// ContactSalesStep — the Enterprise lead branch (F8). A clean form pre-filled
// from the account fields (name/email) and the discovery profile (company/size),
// plus a phone field and an optional note. Client validation guards the obvious
// gaps; the backend sanitizes + validates server-side. On success it swaps to a
// calm "our team will reach out" panel.
//
// Product-register calm: solid-ink heading (no gradient text), restrained
// surfaces, accent reserved for the single primary action. Reduced-motion safe;
// RTL-aware. Dumb UI — the submit goes through the wizard's submitContactSalesLead
// (which composes the reused provisioning hook + injects the discovery context).
// ═══════════════════════════════════════════════════════════════════════════

// Keep in sync with the backend MaxMessageLength to avoid silent truncation.
const NOTE_MAX_LENGTH = 2000;

interface ContactSalesStepProps {
  wizard: SignupWizardViewModel;
}

/**
 * Presentation UI component rendering the contact sales step.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ContactSalesStep({ wizard }: ContactSalesStepProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const { wizardData, selectedPlan } = wizard;

  const [fullName, setFullName] = useState(wizardData.fullName ?? "");
  const [email, setEmail] = useState(wizardData.email ?? "");
  const [company, setCompany] = useState(wizardData.workspaceName ?? "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"fullName" | "email" | "company" | "phone", string>>
  >({});

  const inputStyle = {
    background: tokens.surfaceRaised,
    borderColor: tokens.border,
    color: tokens.ink,
  } as const;
  const errorTextStyle = { color: tokens.error } as const;

  const validate = (): boolean => {
    const next: Partial<Record<"fullName" | "email" | "company" | "phone", string>> = {};
    if (!fullName.trim()) next.fullName = t("signup.errors.fullNameRequired");
    if (!email.trim()) next.email = t("signup.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = t("signup.errors.emailInvalid");
    if (!company.trim()) next.company = t("signup.contactSales.companyRequired");
    if (phone.trim() && !isValidPhoneNumber(phone)) {
      next.phone = t("signup.errors.phoneInvalid");
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await wizard.submitContactSalesLead({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      phone: phone.trim() || null,
      // Company size comes from the discovery profile — no need to re-ask.
      companySize: wizardData.teamSize ?? null,
      note: note.trim() || null,
    });
    if (ok) setSubmitted(true);
  };

  // ── Success panel ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 py-14 text-center sm:px-8"
        dir={direction}
      >
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: `${tokens.success}1f`, border: `1px solid ${tokens.success}55` }}
        >
          <Check className="h-7 w-7" aria-hidden="true" style={{ color: tokens.success }} />
        </div>
        <h1
          className="text-[1.375rem] font-semibold"
          style={{ color: tokens.ink, letterSpacing: "-0.02em" }}
        >
          {t("signup.contactSales.successTitle")}
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {t("signup.contactSales.successSubtitle")}
        </p>

        <div
          className="mt-6 w-full rounded-xl p-4 text-start"
          style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
        >
          <p className="mb-3 text-[0.75rem] font-semibold" style={{ color: tokens.inkMuted }}>
            {t("signup.contactSales.whatsNext")}
          </p>
          {[
            t("signup.contactSales.next1"),
            t("signup.contactSales.next2"),
            t("signup.contactSales.next3"),
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 py-1">
              <Check
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
                style={{ color: tokens.cyan }}
              />
              <span className="text-[0.8125rem]" style={{ color: tokens.inkMuted }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* <button
          type="button"
          onClick={wizard.editPlan}
          className="mx-auto mt-6 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80"
          style={{ color: tokens.inkMuted }}
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
          {t("signup.contactSales.backToPlans")}
        </button> */}
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-10 sm:px-8 sm:py-14" dir={direction}>
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
          {t("signup.contactSales.title")}
        </h1>
        <p className="text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {selectedPlan?.name
            ? `${t("signup.contactSales.interested")} ${selectedPlan.name}`
            : t("signup.contactSales.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* ── Full name ── */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="cs-fullname"
            className="text-[0.8125rem] font-medium"
            style={{ color: tokens.inkMuted }}
          >
            {t("signup.account.fullName")}
          </Label>
          <Input
            id="cs-fullname"
            type="text"
            autoComplete="name"
            autoFocus
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }));
            }}
            placeholder={t("signup.account.fullNamePlaceholder")}
            aria-invalid={!!fieldErrors.fullName}
            maxLength={100}
            className="h-11"
            style={inputStyle}
          />
          {fieldErrors.fullName && (
            <p role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        {/* ── Work email ── */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="cs-email"
            className="text-[0.8125rem] font-medium"
            style={{ color: tokens.inkMuted }}
          >
            {t("signup.account.workEmail")}
          </Label>
          <Input
            id="cs-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder={t("signup.account.emailPlaceholder")}
            aria-invalid={!!fieldErrors.email}
            className="h-11"
            style={inputStyle}
          />
          {fieldErrors.email && (
            <p role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* ── Company ── */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="cs-company"
            className="text-[0.8125rem] font-medium"
            style={{ color: tokens.inkMuted }}
          >
            {t("signup.contactSales.company")}
          </Label>
          <Input
            id="cs-company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              if (fieldErrors.company) setFieldErrors((p) => ({ ...p, company: undefined }));
            }}
            placeholder={t("signup.contactSales.companyPlaceholder")}
            aria-invalid={!!fieldErrors.company}
            maxLength={200}
            className="h-11"
            style={inputStyle}
          />
          {fieldErrors.company && (
            <p role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {fieldErrors.company}
            </p>
          )}
        </div>

        {/* ── Phone (optional) ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="cs-phone"
              className="text-[0.8125rem] font-medium"
              style={{ color: tokens.inkMuted }}
            >
              {t("signup.contactSales.phone")}
            </Label>
            <span className="text-[0.6875rem]" style={{ color: tokens.inkFaint }}>
              {t("signup.common.optional")}
            </span>
          </div>
          <PhoneInput
            id="cs-phone"
            value={phone}
            onChange={setPhone}
            className="h-11"
            style={inputStyle}
            error={fieldErrors.phone}
            defaultCountry={(wizardData.region as Country) || undefined}
          />
          {fieldErrors.phone && (
            <p role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {fieldErrors.phone}
            </p>
          )}
        </div>

        {/* ── Note (optional) ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="cs-note"
              className="text-[0.8125rem] font-medium"
              style={{ color: tokens.inkMuted }}
            >
              {t("signup.contactSales.noteLabel")}
            </Label>
            <span className="text-[0.6875rem]" style={{ color: tokens.inkFaint }}>
              {t("signup.common.optional")}
            </span>
          </div>
          <Textarea
            id="cs-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            placeholder={t("signup.contactSales.notePlaceholder")}
            aria-describedby="cs-note-count"
            className="resize-none"
            style={inputStyle}
          />
          <p
            id="cs-note-count"
            aria-live="polite"
            className="text-end text-[0.6875rem]"
            style={{ color: note.length > NOTE_MAX_LENGTH * 0.9 ? tokens.error : tokens.inkFaint }}
          >
            {note.length}/{NOTE_MAX_LENGTH}
          </p>
        </div>

        {/* ── Flow error ── */}
        {wizard.error && (
          <div
            role="alert"
            className="rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium"
            style={{
              background: `${tokens.error}1a`,
              border: `1px solid ${tokens.error}40`,
              color: tokens.error,
            }}
          >
            {wizard.error}
          </div>
        )}

        {/* ── Primary CTA ── */}
        <button
          type="submit"
          disabled={wizard.isSubmitting}
          aria-busy={wizard.isSubmitting}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transform-none"
          style={{
            background: tokens.gradientCta,
            color: tokens.accentContrast,
            boxShadow: tokens.shadowCard,
          }}
        >
          {wizard.isSubmitting ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span className="sr-only">{t("signup.common.loading")}</span>
            </>
          ) : (
            <>
              {t("signup.contactSales.cta")}
              <ArrowRight className="h-4 w-4 rtl:scale-x-[-1]" aria-hidden="true" />
            </>
          )}
        </button>

        {/* ── Back ── */}
        <button
          type="button"
          onClick={wizard.editPlan}
          disabled={wizard.isSubmitting}
          className="mx-auto inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
          style={{ color: tokens.inkMuted }}
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
          {t("signup.common.back")}
        </button>
      </form>
    </div>
  );
}

export default ContactSalesStep;
