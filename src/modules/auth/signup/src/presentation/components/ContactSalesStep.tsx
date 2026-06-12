"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { Loader2, ArrowRight, CheckCircle, Sparkles, Building2, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface ContactSalesStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
  editionName?: string;
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "200+"] as const;

export function ContactSalesStep({ vm, editionName }: ContactSalesStepProps) {
  const { t, direction } = useI18n();

  const [note, setNote] = useState("");
  const [company, setCompany] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await vm.submitContactSales({
      fullName: vm.wizardData.fullName,
      email: vm.wizardData.email,
      company,
      companySize,
      note,
    });
    if (ok) setSubmitted(true);
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 py-6 text-center"
        dir={direction}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <CheckCircle className="h-8 w-8" style={{ color: BRAND_TOKENS.text.success }} />
        </motion.div>

        <div>
          <h2 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
            {t("signup.contactSales.successTitle") || "We'll be in touch!"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
            {t("signup.contactSales.successSubtitle") ||
              "Our sales team will reach out within 1 business day."}
          </p>
        </div>

        {/* What happens next */}
        <div
          className="w-full rounded-xl p-4 text-left"
          style={{
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.12)",
          }}
        >
          <p className="mb-3 text-xs font-semibold" style={{ color: BRAND_TOKENS.text.brand }}>
            What happens next
          </p>
          {[
            "Our team reviews your requirements",
            "You'll get a tailored demo invitation",
            "Custom pricing for your business",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 py-1">
              <Sparkles className="h-3 w-3 flex-shrink-0" style={{ color: "#22D3EE" }} />
              <span className="text-xs" style={{ color: BRAND_TOKENS.text.secondary }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          type="button"
          onClick={vm.goBack}
          className="rounded-xl"
          style={{
            borderColor: "rgba(168,85,247,0.3)",
            color: BRAND_TOKENS.text.brand,
          }}
        >
          {t("signup.contactSales.backToPlans") || "← Back to plans"}
        </Button>
      </motion.div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div dir={direction} style={{ animation: "sxScreenIn 0.4s ease-out" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2
          className="text-xl font-bold"
          style={{
            background: BRAND_TOKENS.gradient.heroText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("signup.contactSales.title") || "Talk to our sales team"}
        </h2>
        {editionName && (
          <p className="mt-1 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
            {t("signup.contactSales.interested") || "Interested in:"}{" "}
            <span style={{ color: BRAND_TOKENS.text.brand }}>{editionName}</span>
          </p>
        )}
      </div>

      {/* Discovery summary — show Q1/Q2/Q3 answers the user gave in DiscoveryStep */}
      {(vm.wizardData.businessType || vm.wizardData.teamSize || vm.wizardData.primaryPriority) && (
        <div
          className="mb-5 rounded-xl p-4"
          style={{
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.14)",
          }}
        >
          <p className="mb-3 text-xs font-semibold" style={{ color: BRAND_TOKENS.text.brand }}>
            {t("signup.contactSales.yourAnswers") || "Your answers"}
          </p>
          <div className="space-y-2">
            {vm.wizardData.businessType && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND_TOKENS.text.cyan }} />
                <span className="text-xs" style={{ color: BRAND_TOKENS.text.secondary }}>
                  {vm.wizardData.businessType}
                </span>
              </div>
            )}
            {vm.wizardData.teamSize && (
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND_TOKENS.text.cyan }} />
                <span className="text-xs" style={{ color: BRAND_TOKENS.text.secondary }}>
                  {vm.wizardData.teamSize}
                </span>
              </div>
            )}
            {vm.wizardData.primaryPriority && (
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND_TOKENS.text.cyan }} />
                <span className="text-xs" style={{ color: BRAND_TOKENS.text.secondary }}>
                  {vm.wizardData.primaryPriority}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name — pre-filled */}
        <div className="space-y-1.5">
          <Label
            htmlFor="cs-fullname"
            className="text-xs font-medium"
            style={{ color: BRAND_TOKENS.text.secondary }}
          >
            {t("signup.account.fullName") || "Full name"}
          </Label>
          <Input
            id="cs-fullname"
            type="text"
            required
            value={vm.wizardData.fullName}
            onChange={(e) => vm.updateField("fullName", e.target.value)}
            placeholder={t("signup.account.fullNamePlaceholder") || "John Doe"}
            autoFocus
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: BRAND_TOKENS.text.primary,
            }}
          />
        </div>

        {/* Business Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="cs-email"
            className="text-xs font-medium"
            style={{ color: BRAND_TOKENS.text.secondary }}
          >
            {t("signup.account.workEmail") || "Work email"}
          </Label>
          <Input
            id="cs-email"
            type="email"
            required
            value={vm.wizardData.email}
            onChange={(e) => vm.updateField("email", e.target.value)}
            placeholder={t("signup.account.emailPlaceholder") || "you@example.com"}
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: BRAND_TOKENS.text.primary,
            }}
          />
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label
            htmlFor="cs-company"
            className="text-xs font-medium"
            style={{ color: BRAND_TOKENS.text.secondary }}
          >
            {t("signup.contactSales.company") || "Company"}
          </Label>
          <Input
            id="cs-company"
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={t("signup.contactSales.companyPlaceholder") || "Acme Inc."}
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: BRAND_TOKENS.text.primary,
            }}
          />
        </div>

        {/* Company size — RadioGroup from @core/ui */}
        <div className="space-y-2">
          <Label className="text-xs font-medium" style={{ color: BRAND_TOKENS.text.secondary }}>
            {t("signup.contactSales.companySize") || "Company size"}
          </Label>
          <RadioGroup
            value={companySize}
            onValueChange={setCompanySize}
            className="grid grid-cols-4 gap-2"
          >
            {COMPANY_SIZES.map((size) => (
              <div key={size} className="relative">
                <RadioGroupItem
                  value={size}
                  id={`cs-size-${size}`}
                  className="sr-only"
                />
                <label
                  htmlFor={`cs-size-${size}`}
                  className="flex cursor-pointer items-center justify-center rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200"
                  style={{
                    background:
                      companySize === size
                        ? BRAND_TOKENS.gradient.planCard
                        : "rgba(255,255,255,0.03)",
                    border:
                      companySize === size
                        ? BRAND_TOKENS.border.active
                        : BRAND_TOKENS.border.muted,
                    color:
                      companySize === size
                        ? BRAND_TOKENS.text.primary
                        : BRAND_TOKENS.text.tertiary,
                    cursor: "pointer",
                  }}
                >
                  {size}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Note (optional) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="cs-note"
            className="text-xs font-medium"
            style={{ color: BRAND_TOKENS.text.secondary }}
          >
            {t("signup.contactSales.noteLabel") || "Anything you'd like to share?"}{" "}
            <span style={{ color: BRAND_TOKENS.text.ghost }}>
              ({t("signup.common.optional") || "optional"})
            </span>
          </Label>
          <Textarea
            id="cs-note"
            rows={3}
            placeholder={
              t("signup.contactSales.notePlaceholder") ||
              "Team size, timeline, specific requirements…"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: BRAND_TOKENS.text.primary,
            }}
          />
        </div>

        {/* Error */}
        {vm.error && (
          <div
            className="rounded-lg px-3 py-2 text-xs font-medium"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#fca5a5",
              animation: "sxRise 0.3s ease-out",
            }}
            role="alert"
          >
            {vm.error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={vm.isLoading}
          className="h-12 w-full rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{
            background: BRAND_TOKENS.gradient.cta,
            boxShadow: BRAND_TOKENS.shadow.cta,
          }}
        >
          {vm.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t("signup.contactSales.cta") || "Request a demo"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            type="button"
            onClick={vm.goBack}
            className="text-sm font-medium underline underline-offset-2"
            style={{ color: BRAND_TOKENS.text.tertiary }}
          >
            {t("signup.common.back") || "← Back"}
          </Button>
        </div>
      </form>
    </div>
  );
}
