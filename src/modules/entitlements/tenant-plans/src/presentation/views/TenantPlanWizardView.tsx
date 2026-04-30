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
import { ArrowLeft, ArrowRight, Save, LayoutTemplate, Pencil, Settings, CheckSquare } from "lucide-react";
import Link from "next/link";
import { WizardStepIndicator } from "@modules/entitlements/editions/src/presentation/components/wizard/WizardStepIndicator";
import { TenantPlanStepBasics } from "../components/wizard/TenantPlanStepBasics";
import { TenantPlanStepBilling } from "../components/wizard/TenantPlanStepBilling";
import { TenantPlanStepReview } from "../components/wizard/TenantPlanStepReview";

export function TenantPlanWizardView() {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t } = useI18n();
  const vm = useTenantPlanCreateViewModel();

  const STEPS = [
    { id: "1", label: t("entitlements.tenantPlans.stepBasics") || "Basics", icon: Pencil },
    { id: "2", label: t("entitlements.tenantPlans.stepBilling") || "Billing & Access", icon: Settings },
    { id: "3", label: t("common.review") || "Review", icon: CheckSquare },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/entitlements/tenant-plans">
          <Button variant="outline" size="icon" className="shrink-0 mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <LayoutTemplate className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("entitlements.tenantPlans.createPlan") || "Create Tenant Plan"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {t("entitlements.tenantPlans.createPlanDesc") || "Configure a new plan for your tenants to subscribe to."}
          </p>
        </div>
      </div>

      {/* Wizard Indicator */}
      <WizardStepIndicator currentStep={vm.step - 1} steps={STEPS} />

      {/* Wizard Content */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
        
        <CardContent className="p-6 sm:p-10 min-h-[400px]">
          {vm.step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <TenantPlanStepBasics form={vm.form} updateForm={vm.updateForm} t={t} />
            </div>
          )}
          {vm.step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <TenantPlanStepBilling form={vm.form} updateForm={vm.updateForm} t={t} />
            </div>
          )}
          {vm.step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <TenantPlanStepReview form={vm.form} t={t} />
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 bg-muted/20 border-t border-border/40">
          <Button
            variant="outline"
            onClick={vm.prevStep}
            disabled={vm.step === 1 || vm.isSubmitting}
            className="w-28"
          >
            {t("common.back") || "Back"}
          </Button>
          
          {vm.step < STEPS.length ? (
            <Button onClick={vm.nextStep} className="w-28 shadow-sm">
              {t("common.continue") || "Continue"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => vm.submit()} 
              loading={vm.isSubmitting} 
              disabled={!vm.form.name}
              className="w-32 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {!vm.isSubmitting && <Save className="h-4 w-4 mr-2" />}
              {t("common.create") || "Create Plan"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
