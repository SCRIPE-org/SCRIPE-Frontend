"use client";

import type { FieldConfig } from "@core/ui/forms/generic-form";
import { CustomFieldsSection } from "@core/components/custom-fields";
import { TENANT_PLAN_ENTITY_TYPE_KEY } from "../../viewmodels/useTenantPlanCreateViewModel";

interface TenantPlanStepCustomFieldsProps {
  fieldConfigs: FieldConfig[];
  loading: boolean;
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onFieldCreated: () => void;
  entityDisplayName: string;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the tenant plan step custom fields.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanStepCustomFields({
  fieldConfigs,
  loading,
  values,
  onChange,
  onFieldCreated,
  entityDisplayName,
  t,
}: TenantPlanStepCustomFieldsProps) {
  return (
    <div className="space-y-6">
      <CustomFieldsSection
        configs={fieldConfigs}
        values={values}
        onChange={onChange}
        isLoading={loading}
        emptyMessage={t("entitlements.tenantPlans.noCustomFields")}
        entityTypeKey={TENANT_PLAN_ENTITY_TYPE_KEY}
        entityDisplayName={entityDisplayName}
        onFieldCreated={onFieldCreated}
        className="space-y-5"
      />
    </div>
  );
}
