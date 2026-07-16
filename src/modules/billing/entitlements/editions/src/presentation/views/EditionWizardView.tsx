"use client";
/**
 * EditionWizardView — Premium multi-step Create wizard for Editions.
 * Full localization, sectioned layout, themed stepper.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  ArrowLeft,
  Tag,
  CreditCard,
  DollarSign,
  Eye,
} from "lucide-react";
import Link from "next/link";

import { useEditionCreateViewModel } from "../viewmodels/useEditionCreateViewModel";
import { WizardStepIndicator } from "../components/wizard/WizardStepIndicator";
import { WizardStepBasics } from "../components/wizard/WizardStepBasics";
import { WizardStepBilling } from "../components/wizard/WizardStepBilling";
import { WizardStepPricing } from "../components/wizard/WizardStepPricing";
import { WizardStepReview } from "../components/wizard/WizardStepReview";

/**
 * EditionWizardView renders the multi-step wizard interface for creating new platform subscription editions.
 *
 * Flow details:
 * - Coordinates steps for Basic settings (name, metadata), Billing (rules, trials), Pricing (currency-specific amounts), and Final review.
 * - Synchronizes with i18n locales via hook-based lazy translation loaders.
 * - Integrates with a themed stepper indicator and maps back-and-forth wizard navigation using the edition create view-model.
 *
 * @returns A structured layout combining design system components (@core/ui/*) to guide the admin through edition setup.
 */
export function EditionWizardView() {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t } = useI18n();
  const vm = useEditionCreateViewModel();

  const STEPS = [
    { id: "basics", label: t("entitlements.editions.wizard.stepBasics") || "Basics", icon: Tag },
    {
      id: "billing",
      label: t("entitlements.editions.wizard.stepBilling") || "Billing",
      icon: CreditCard,
    },
    {
      id: "pricing",
      label: t("entitlements.editions.wizard.stepPricing") || "Pricing",
      icon: DollarSign,
    },
    { id: "review", label: t("entitlements.editions.wizard.stepReview") || "Review", icon: Eye },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/entitlements/editions">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {t("entitlements.editions.wizard.createEdition") || "Create Edition"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("entitlements.editions.wizard.reviewSectionDesc") ||
              "Configure a new subscription edition for your platform."}
          </p>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="overflow-x-auto pb-1">
        <WizardStepIndicator steps={STEPS} currentStep={vm.step} />
      </div>

      {/* ── Step content ── */}
      <div className="min-h-[400px] border border-border bg-card p-6 md:p-8">
        {vm.step === 0 && (
          <WizardStepBasics
            form={vm.form}
            onChange={vm.onChange}
            isEditMode={false}
            availableEditions={vm.availableEditions}
          />
        )}
        {vm.step === 1 && <WizardStepBilling form={vm.form} onChange={vm.onChange} />}
        {vm.step === 2 && (
          <WizardStepPricing form={vm.form} prices={vm.prices} onPriceChange={vm.onPriceChange} />
        )}
        {vm.step === 3 && <WizardStepReview form={vm.form} prices={vm.prices} />}
      </div>

      {/* ── Error ── */}
      {vm.error && (
        <div className="flex items-center gap-2 border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span className="shrink-0">⚠</span>
          {vm.error}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={vm.prevStep}
          disabled={vm.isSubmitting}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {vm.step === 0 ? t("common.cancel") || "Cancel" : t("common.back") || "Back"}
        </Button>

        {vm.step < STEPS.length - 1 ? (
          <Button onClick={vm.nextStep} disabled={!vm.canProceed()} className="gap-2">
            {t("common.next") || "Next"}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        ) : (
          <Button
            onClick={vm.handleSubmit}
            disabled={vm.isSubmitting || !vm.form.name?.trim()}
            className="gap-2"
          >
            {vm.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t("common.creating") || "Creating…"}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />{" "}
                {t("entitlements.editions.wizard.createEdition") || "Create Edition"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
