/**
 * TenantPlanWizardView — Elevated Tier 2 Architecture
 * Orchestrates the creation wizard using clean ViewModel isolation.
 */
"use client";

import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantPlanCreateViewModel } from "../viewmodels/useTenantPlanCreateViewModel";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  LayoutTemplate,
  Pencil,
  Settings,
  CheckSquare,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { WizardStepIndicator } from "@modules/entitlements/core";
import { TenantPlanStepBasics } from "../components/wizard/TenantPlanStepBasics";
import { TenantPlanStepBilling } from "../components/wizard/TenantPlanStepBilling";
import { TenantPlanStepReview } from "../components/wizard/TenantPlanStepReview";
import { TenantPlanStepCustomFields } from "../components/wizard/TenantPlanStepCustomFields";

const STEP_TRANSITION =
  "duration-nx-standard animate-in fade-in ease-nx-enter motion-reduce:animate-none";

/**
 * Presentation UI component rendering the tenant plan wizard view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanWizardView() {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t, direction } = useI18n();
  const vm = useTenantPlanCreateViewModel();
  const isRtl = direction === "rtl";

  const STEPS = [
    { id: "1", label: t("entitlements.tenantPlans.stepBasics"), icon: Pencil },
    { id: "2", label: t("entitlements.tenantPlans.stepBilling"), icon: Settings },
    { id: "3", label: t("entitlements.tenantPlans.stepCustomFields"), icon: Tags },
    { id: "4", label: t("common.review"), icon: CheckSquare },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/entitlements/tenant-plans">
          <Button variant="outline" size="icon" className="mt-1 shrink-0">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{t("common.back")}</span>
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-control bg-nx-accent-wash"
              aria-hidden="true"
            >
              <LayoutTemplate className="h-4.5 w-4.5 text-nx-accent" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-nx-ink">
              {t("entitlements.tenantPlans.createPlan")}
            </h1>
          </div>
          <p className="mt-1 text-nx-ink-2">{t("entitlements.tenantPlans.createPlanDesc")}</p>
        </div>
      </div>

      {/* Wizard Indicator */}
      <WizardStepIndicator currentStep={vm.step - 1} steps={STEPS} />

      {/* Wizard Content */}
      <Card>
        <CardContent className="min-h-[400px] p-6 sm:p-10">
          {vm.step === 1 && (
            <div className={STEP_TRANSITION}>
              <TenantPlanStepBasics form={vm.form} updateForm={vm.updateForm} t={t} />
            </div>
          )}
          {vm.step === 2 && (
            <div className={STEP_TRANSITION}>
              <TenantPlanStepBilling form={vm.form} updateForm={vm.updateForm} t={t} />
            </div>
          )}
          {vm.step === 3 && (
            <div className={STEP_TRANSITION}>
              <TenantPlanStepCustomFields
                fieldConfigs={vm.customFieldConfigs}
                loading={vm.customFieldsLoading}
                values={vm.customFieldValues}
                onChange={vm.updateCustomFieldValue}
                onFieldCreated={() => void vm.refetchCustomFields()}
                entityDisplayName={t("entitlements.tenantPlans.title")}
                t={t}
              />
            </div>
          )}
          {vm.step === 4 && (
            <div className={STEP_TRANSITION}>
              <TenantPlanStepReview form={vm.form} t={t} />
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-nx-line bg-nx-raised p-6">
          <Button
            variant="outline"
            onClick={vm.prevStep}
            disabled={vm.step === 1 || vm.isSubmitting}
            className="w-28"
          >
            {t("common.back")}
          </Button>

          {vm.step < STEPS.length ? (
            <Button onClick={vm.nextStep} className="w-28 gap-2">
              {t("common.continue")}
              {isRtl ? (
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          ) : (
            <Button
              onClick={() => vm.submit()}
              loading={vm.isSubmitting}
              disabled={!vm.form.name}
              className="w-32 gap-2"
            >
              {!vm.isSubmitting && <Save className="h-4 w-4" aria-hidden="true" />}
              {t("common.create")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
