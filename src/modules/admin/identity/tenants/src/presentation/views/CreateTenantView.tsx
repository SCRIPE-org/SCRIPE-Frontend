/**
 * CreateTenantView — Premium Multi-Step Wizard
 *
 * Thin orchestrator view (~50 lines) that wires up the ViewModel
 * and delegates rendering to extracted sub-components.
 *
 * Step 1: Organization info (name, code, description)
 * Step 2: Administrator setup (email, username)
 * Step 3: Plan & billing (edition, subscription type, promo code, skip payment)
 *
 * Clean Architecture: View → ViewModel → Repository
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { useCreateTenantViewModel } from "../viewmodels/useCreateTenantViewModel";
import {
  CreateTenantStepIndicator,
  CreateTenantStep1,
  CreateTenantStep2,
  CreateTenantStep3,
  CreateTenantSuccess,
} from "../components/create-tenant";

/**
 * Presentation UI component rendering the create tenant view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CreateTenantView() {
  useModuleLocales(() => import("../../../locales"), "tenants");

  const searchParams = useSearchParams();
  const parentId = searchParams.get("parentId") || undefined;
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const vm = useCreateTenantViewModel({ defaultParentId: parentId });

  // ── Success state ──
  if (vm.result) {
    return <CreateTenantSuccess vm={vm} t={t} direction={direction} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6" dir={direction}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("tenant.createTitle") || "Create New Tenant"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("tenant.createSubtitle") ||
            "Set up a new organization with an administrator and subscription plan."}
        </p>
      </div>

      {/* Step Indicator */}
      <CreateTenantStepIndicator
        currentStep={vm.currentStep}
        isStepValid={vm.isStepValid}
        goToStep={vm.goToStep}
        t={t}
        isRtl={isRtl}
      />

      {/* Step Content */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="p-6 md:p-8">
          {vm.currentStep === 1 && <CreateTenantStep1 vm={vm} t={t} />}
          {vm.currentStep === 2 && <CreateTenantStep2 vm={vm} t={t} />}
          {vm.currentStep === 3 && <CreateTenantStep3 vm={vm} t={t} />}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-6 py-4 md:px-8">
          <Button
            variant="ghost"
            onClick={vm.goBack}
            disabled={vm.currentStep === 1}
            className="gap-2"
          >
            {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {t("common.back") || "Back"}
          </Button>

          {vm.currentStep < 3 ? (
            <Button onClick={vm.goNext} disabled={!vm.canProceed} className="gap-2">
              {t("common.next") || "Next"}
              {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <Button
              onClick={vm.handleSubmit}
              disabled={!vm.canProceed}
              loading={vm.isSubmitting}
              className="min-w-[160px] gap-2"
            >
              {!vm.isSubmitting && <Check className="h-4 w-4" />}
              {vm.isSubmitting
                ? t("common.creating") || "Creating..."
                : t("tenant.createTenant") || "Create Tenant"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
