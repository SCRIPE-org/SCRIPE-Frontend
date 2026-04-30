"use client";
/**
 * EditionEditWizardView — Pre-populated multi-step wizard to edit an Edition.
 * Basics + Billing + Review. Pricing is managed via the Detail view.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import {
  ChevronRight, ChevronLeft, Check, Loader2, ArrowLeft,
  Tag, CreditCard, Eye,
} from "lucide-react";
import Link from "next/link";

import { useEditionEditViewModel } from "../viewmodels/useEditionEditViewModel";
import { WizardStepIndicator } from "../components/wizard/WizardStepIndicator";
import { WizardStepBasics } from "../components/wizard/WizardStepBasics";
import { WizardStepBilling } from "../components/wizard/WizardStepBilling";
import { WizardStepReview } from "../components/wizard/WizardStepReview";

interface EditionEditWizardViewProps {
  editionId: string;
}

export function EditionEditWizardView({ editionId }: EditionEditWizardViewProps) {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t } = useI18n();
  const vm = useEditionEditViewModel(editionId);

  const STEPS = [
    { id: "basics",  label: t("entitlements.editions.wizard.stepBasics") || "Basics",  icon: Tag },
    { id: "billing", label: t("entitlements.editions.wizard.stepBilling") || "Billing", icon: CreditCard },
    { id: "review",  label: t("entitlements.editions.wizard.stepReview") || "Review",  icon: Eye },
  ] as const;

  if (vm.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("common.loading") || "Loading…"}</p>
      </div>
    );
  }

  const displayName = vm.edition?.getDisplayName("en") ?? "Edition";

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link href={`/entitlements/editions/${editionId}`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {t("entitlements.editions.wizard.editEdition") || "Edit Edition"}
          </h1>
          <p className="text-sm text-muted-foreground">{displayName}</p>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="overflow-x-auto pb-1">
        <WizardStepIndicator steps={STEPS} currentStep={vm.step} />
      </div>

      {/* ── Step content ── */}
      <div className="border border-border bg-card p-6 md:p-8 min-h-[380px]">
        {vm.step === 0 && <WizardStepBasics form={vm.form} onChange={vm.onChange} isEditMode={true} />}
        {vm.step === 1 && <WizardStepBilling form={vm.form} onChange={vm.onChange} />}
        {vm.step === 2 && <WizardStepReview form={vm.form} />}
      </div>

      {/* ── Error ── */}
      {vm.error && (
        <div className="border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
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
          {vm.step === 0 ? (t("common.cancel") || "Cancel") : (t("common.back") || "Back")}
        </Button>

        {vm.step < STEPS.length - 1 ? (
          <Button onClick={vm.nextStep} className="gap-2">
            {t("common.next") || "Next"}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        ) : (
          <Button onClick={vm.handleSubmit} disabled={vm.isSubmitting} className="gap-2">
            {vm.isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving") || "Saving…"}</>
            ) : (
              <><Check className="h-4 w-4" /> {t("common.saveChanges") || "Save Changes"}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
