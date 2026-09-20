"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { ArrowLeft, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { DynamicCustomField } from "../DynamicCustomField";
import type { useAccountSetupViewModel } from "../../viewmodels/useAccountSetupViewModel";

export interface SetupStep3AttributesProps {
  vm: ReturnType<typeof useAccountSetupViewModel>;
  hasCustomFields: boolean;
}

/**
 * Step 3: Organization Attributes & Compliance (Dynamic Custom Fields).
 */
export function SetupStep3Attributes({
  vm,
  hasCustomFields,
}: SetupStep3AttributesProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5 min-w-0">
      {/* Compliance Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          Additional organizational and compliance attributes required for your administrator profile. Sensitive fields are end-to-end encrypted.
        </p>
      </div>

      {/* Dynamic Custom Fields Grid */}
      {vm.isLoadingCustomFields ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading attributes...
        </div>
      ) : hasCustomFields ? (
        <div className="grid gap-4 sm:grid-cols-2 min-w-0">
          {vm.customFields.map((field) => (
            <DynamicCustomField
              key={field.key}
              field={field}
              value={vm.customFieldValues[field.key]}
              onChange={(val) => vm.setCustomFieldValue(field.key, val)}
              invalid={vm.attributesTouched && Boolean(vm.customFieldErrors[field.key])}
              error={vm.attributesTouched ? vm.customFieldErrors[field.key] : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
          {t("auth.accountSetup.noAttributesNeeded")}
        </div>
      )}

      {/* Step 3 Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 gap-1.5"
          onClick={vm.goToPrevStep}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("auth.accountSetup.back")}</span>
        </Button>

        <Button
          type="button"
          size="lg"
          className="flex-1 gap-1.5 font-semibold shadow-xs"
          disabled={!vm.isAttributesValid}
          loading={vm.pageState === "activating"}
          onClick={vm.activate}
        >
          <span>{t("auth.accountSetup.completeSetup")}</span>
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
