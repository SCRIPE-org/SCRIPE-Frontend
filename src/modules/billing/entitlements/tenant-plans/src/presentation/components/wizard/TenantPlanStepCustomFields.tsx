"use client";

import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { renderCustomFieldControl } from "@modules/custom-fields/custom-field/src/presentation/renderCustomFieldControl";
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

/** Mirrors generic-crud-view.tsx's own private CustomFieldsExtensionTrigger wrapper. */
function CustomFieldsAddTrigger({
  entityDisplayName,
  onCreated,
}: {
  entityDisplayName: string;
  onCreated: () => void;
}) {
  const api = getCustomFieldsExtension();
  if (!api) return null;
  const Trigger = api.InlineAddTrigger;
  return (
    <Trigger
      entityTypeKey={TENANT_PLAN_ENTITY_TYPE_KEY}
      entityDisplayName={entityDisplayName}
      onCreated={onCreated}
    />
  );
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
      <div className="space-y-5">
        {fieldConfigs.map((fc) => {
          const value = values[fc.name] ?? fc.defaultValue ?? "";
          return renderCustomFieldControl({
            fc,
            value,
            onChange: (v) => onChange(fc.name, v),
          });
        })}

        {fieldConfigs.length === 0 && !loading && (
          <p className="text-sm text-nx-ink-2">{t("entitlements.tenantPlans.noCustomFields")}</p>
        )}

        <CustomFieldsAddTrigger entityDisplayName={entityDisplayName} onCreated={onFieldCreated} />
      </div>
    </div>
  );
}
