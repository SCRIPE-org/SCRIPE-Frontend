"use client";
/**
 * EditionEditWizardView — Pre-populated multi-step wizard to edit an Edition's
 * core settings (Basics, Billing). Feature values are managed via the
 * dedicated FeaturesTab in the detail view.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
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

const STEPS = [
  { id: "basics",  label: "Basics",  icon: Tag },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "review",  label: "Review",  icon: Eye },
] as const;

interface EditionEditWizardViewProps {
  editionId: string;
}

export function EditionEditWizardView({ editionId }: EditionEditWizardViewProps) {
  const { t } = useI18n();
  const vm = useEditionEditViewModel(editionId);

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = vm.edition?.getDisplayName("en") ?? "Edition";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <div className="flex items-center gap-3">
        <Link href={`/entitlements/editions/${editionId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold">{t("entitlements.editions.wizard.editEdition") || "Edit Edition"}</h1>
          <p className="text-sm text-muted-foreground">{displayName}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="overflow-x-auto pb-1">
        <WizardStepIndicator steps={STEPS} currentStep={vm.step} />
      </div>

      {/* Step content */}
      <div className="border border-border bg-card p-6 min-h-[380px]">
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          {STEPS[vm.step].label}
        </h2>
        {vm.step === 0 && <WizardStepBasics form={vm.form} onChange={vm.onChange} isEditMode={true} />}
        {vm.step === 1 && <WizardStepBilling form={vm.form} onChange={vm.onChange} />}
        {vm.step === 2 && <WizardStepReview form={vm.form} />}
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
          <Button onClick={vm.nextStep} className="gap-2">
            {t("common.next") || "Next"}
            <ChevronRight className="h-4 w-4" />
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
