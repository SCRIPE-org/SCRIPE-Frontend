"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { DatePicker } from "@core/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
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

function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
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

          if (fc.type === "switch") {
            return (
              <div key={fc.name} className="flex items-center justify-between">
                <Label htmlFor={fc.name}>{fc.label}</Label>
                <Switch
                  id={fc.name}
                  checked={Boolean(value)}
                  onCheckedChange={(v) => onChange(fc.name, v)}
                />
              </div>
            );
          }

          if (fc.type === "select") {
            return (
              <div key={fc.name} className="space-y-2">
                <Label htmlFor={fc.name}>{fc.label}</Label>
                <Select
                  value={toFieldInputValue(value)}
                  onValueChange={(v) => onChange(fc.name, v)}
                >
                  <SelectTrigger id={fc.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fc.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (fc.type === "date") {
            return (
              <div key={fc.name} className="space-y-2">
                <Label htmlFor={fc.name}>{fc.label}</Label>
                <DatePicker
                  id={fc.name}
                  type="date"
                  value={toFieldInputValue(value)}
                  onChange={(v) => onChange(fc.name, v)}
                  required={fc.required}
                />
              </div>
            );
          }

          return (
            <div key={fc.name} className="space-y-2">
              <Label htmlFor={fc.name}>{fc.label}</Label>
              <Input
                id={fc.name}
                type={fc.type === "number" ? "number" : "text"}
                value={toFieldInputValue(value)}
                onChange={(e) => onChange(fc.name, e.target.value)}
                placeholder={fc.placeholder}
                required={fc.required}
              />
            </div>
          );
        })}

        {fieldConfigs.length === 0 && !loading && (
          <p className="text-sm text-nx-ink-2">{t("entitlements.tenantPlans.noCustomFields")}</p>
        )}

        <CustomFieldsAddTrigger entityDisplayName={entityDisplayName} onCreated={onFieldCreated} />
      </div>
    </div>
  );
}
