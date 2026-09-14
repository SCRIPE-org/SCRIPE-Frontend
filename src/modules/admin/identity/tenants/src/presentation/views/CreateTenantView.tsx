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
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { Building2, Check, ChevronLeft, ChevronRight } from "lucide-react";

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawParentId = searchParams.get("parentId") || undefined;
  const parentId = rawParentId === "__SYSTEM__" ? undefined : rawParentId;
  const parentName = rawParentId === "__SYSTEM__" ? undefined : (searchParams.get("parentName") || undefined);
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const vm = useCreateTenantViewModel({ defaultParentId: parentId, defaultParentName: parentName });

  // ── Success state ──
  if (vm.result) {
    return <CreateTenantSuccess vm={vm} t={t} direction={direction} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6" dir={direction}>
      <PageHeader
        icon={Building2}
        title={t("tenant.createTitle")}
        description={t("tenant.createSubtitle")}
        actions={
          <Button variant="ghost" onClick={() => router.push("/tenants")}>
            {t("common.cancel")}
          </Button>
        }
      />

      <div className="mt-8">
        <CreateTenantStepIndicator
          currentStep={vm.currentStep}
          isStepValid={vm.isStepValid}
          goToStep={vm.goToStep}
          t={t}
          stepErrors={vm.stepErrors}
          stepTouched={vm.stepTouched}
        />
      </div>

      {/* Step Content */}
      <Card className="mt-8 overflow-hidden">
        <div className="p-6 md:p-8">
          {vm.currentStep === 1 && <CreateTenantStep1 vm={vm} t={t} />}
          {vm.currentStep === 2 && <CreateTenantStep2 vm={vm} t={t} />}
          {vm.currentStep === 3 && <CreateTenantStep3 vm={vm} t={t} />}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-nx-line bg-nx-raised px-6 py-4 md:px-8">
          <Button
            variant="ghost"
            onClick={vm.goBack}
            disabled={vm.currentStep === 1}
            className="gap-2"
          >
            {isRtl ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
            {t("common.back")}
          </Button>

          {vm.currentStep < 3 ? (
            // Deliberately always enabled. A disabled Next gives no reason: the
            // user clicks, nothing happens, and the invalid field is never
            // named. goNext already marks the step touched, so clicking it now
            // reveals the errors instead of silently refusing.
            <Button onClick={vm.goNext} className="gap-2">
              {t("common.next")}
              {isRtl ? (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          ) : (
            <Button
              onClick={vm.handleSubmit}
              disabled={!vm.canProceed}
              loading={vm.isSubmitting}
              className="min-w-40 gap-2"
            >
              {!vm.isSubmitting && <Check className="h-4 w-4" aria-hidden="true" />}
              {vm.isSubmitting ? t("common.creating") : t("tenant.createTenant")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
