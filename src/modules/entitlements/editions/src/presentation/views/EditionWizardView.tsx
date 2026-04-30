"use client";
/**
 * EditionWizardView — Multi-step Create wizard for Editions.
 * Uses extracted shared wizard components and the useEditionCreateViewModel.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  Tag, CreditCard, DollarSign, Eye,
} from "lucide-react";

import { useEditionCreateViewModel } from "../viewmodels/useEditionCreateViewModel";
import { WizardStepIndicator } from "../components/wizard/WizardStepIndicator";
import { WizardStepBasics } from "../components/wizard/WizardStepBasics";
import { WizardStepBilling } from "../components/wizard/WizardStepBilling";
import { WizardStepPricing } from "../components/wizard/WizardStepPricing";
import { WizardStepReview } from "../components/wizard/WizardStepReview";

const STEPS = [
  { id: "basics",  label: "Basics",  icon: Tag },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "review",  label: "Review",  icon: Eye },
] as const;

export function EditionWizardView() {
  const { t } = useI18n();
  const vm = useEditionCreateViewModel();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Step indicator */}
      <div className="overflow-x-auto pb-1">
        <WizardStepIndicator steps={STEPS} currentStep={vm.step} />
      </div>

      {/* Step content */}
      <div className="border border-border bg-card p-6 min-h-[400px]">
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          {STEPS[vm.step].label}
        </h2>

        {vm.step === 0 && <WizardStepBasics form={vm.form} onChange={vm.onChange} isEditMode={false} />}
        {vm.step === 1 && <WizardStepBilling form={vm.form} onChange={vm.onChange} />}
        {vm.step === 2 && <WizardStepPricing form={vm.form} prices={vm.prices} onPriceChange={vm.onPriceChange} />}
        {vm.step === 3 && <WizardStepReview form={vm.form} prices={vm.prices} />}
      </div>

      {/* Error */}
      {vm.error && (
        <div className="border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {vm.error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={vm.prevStep}
          disabled={vm.isSubmitting}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {vm.step === 0 ? (t("common.cancel") || "Cancel") : (t("common.back") || "Back")}
        </Button>

        {vm.step < STEPS.length - 1 ? (
          <Button
            onClick={vm.nextStep}
            disabled={!vm.canProceed()}
            className="gap-2"
          >
            {t("common.next") || "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={vm.handleSubmit}
            disabled={vm.isSubmitting || !vm.form.name?.trim()}
            className="gap-2"
          >
            {vm.isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.creating") || "Creating…"}</>
            ) : (
              <><Check className="h-4 w-4" /> {t("entitlements.editions.wizard.createEdition") || "Create Edition"}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
