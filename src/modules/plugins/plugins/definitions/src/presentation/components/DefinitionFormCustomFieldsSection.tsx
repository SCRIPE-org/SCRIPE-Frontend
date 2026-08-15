"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { DatePicker } from "@core/ui/date-picker";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Sliders } from "lucide-react";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { DEFINITION_ENTITY_TYPE_KEY } from "../viewmodels/useDefinitionsViewModel";

interface DefinitionFormCustomFieldsSectionProps {
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  updateCustomFieldValue: (name: string, value: unknown) => void;
  refetchCustomFields: () => Promise<void>;
}

function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

/** Mirrors WebhookFormCustomFieldsSection.tsx's own private add-trigger wrapper. */
function DefinitionCustomFieldsAddTrigger({
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
      entityTypeKey={DEFINITION_ENTITY_TYPE_KEY}
      entityDisplayName={entityDisplayName}
      onCreated={onCreated}
    />
  );
}

/**
 * Presentation UI component rendering the plugin definition form's custom
 * fields section. Mirrors WebhookFormCustomFieldsSection.tsx's shape exactly
 * -- same per-type rendering (switch/select/date/text/number), same empty
 * state, same inline add-trigger -- adapted to props instead of a single
 * `vm` object since DefinitionFormDialog is a controlled/dumb component with
 * no paired per-dialog viewmodel (useDefinitionsViewModel owns the mutations
 * and is shared with the list view).
 */
export function DefinitionFormCustomFieldsSection({
  customFieldConfigs,
  customFieldsLoading,
  customFieldValues,
  updateCustomFieldValue,
  refetchCustomFields,
}: DefinitionFormCustomFieldsSectionProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash text-nx-accent">
          <Sliders className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-nx-ink">
            {t("plugins.defCustomFieldsSection")}
          </h3>
          <p className="text-xs text-nx-ink-2">{t("plugins.defCustomFieldsSectionDesc")}</p>
        </div>
      </div>

      {customFieldConfigs.map((fc) => {
        const value = customFieldValues[fc.name] ?? fc.defaultValue ?? "";

        if (fc.type === "switch") {
          return (
            <div key={fc.name} className="flex items-center justify-between">
              <Label htmlFor={fc.name} className="text-sm font-medium">
                {fc.label}
              </Label>
              <Switch
                id={fc.name}
                checked={Boolean(value)}
                onCheckedChange={(v) => updateCustomFieldValue(fc.name, v)}
              />
            </div>
          );
        }

        if (fc.type === "select") {
          return (
            <div key={fc.name} className="space-y-2">
              <Label htmlFor={fc.name} className="text-sm font-medium">
                {fc.label}
              </Label>
              <GenericSelect
                options={fc.options?.map((opt) => ({ value: opt.value, label: opt.label })) ?? []}
                value={toFieldInputValue(value)}
                onValueChange={(v: string | string[]) => updateCustomFieldValue(fc.name, v as string)}
                placeholder={fc.placeholder || fc.label}
                type="single"
              />
            </div>
          );
        }

        if (fc.type === "date") {
          return (
            <div key={fc.name} className="space-y-2">
              <Label htmlFor={fc.name} className="text-sm font-medium">
                {fc.label}
              </Label>
              <DatePicker
                id={fc.name}
                type="date"
                value={toFieldInputValue(value)}
                onChange={(v) => updateCustomFieldValue(fc.name, v)}
                required={fc.required}
              />
            </div>
          );
        }

        return (
          <div key={fc.name} className="space-y-2">
            <Label htmlFor={fc.name} className="text-sm font-medium">
              {fc.label}
            </Label>
            <Input
              id={fc.name}
              type={fc.type === "number" ? "number" : "text"}
              value={toFieldInputValue(value)}
              onChange={(e) => updateCustomFieldValue(fc.name, e.target.value)}
              placeholder={fc.placeholder}
              required={fc.required}
              className="text-sm"
            />
          </div>
        );
      })}

      {customFieldConfigs.length === 0 && !customFieldsLoading && (
        <p className="text-sm text-nx-ink-2">{t("plugins.defNoCustomFields")}</p>
      )}

      <DefinitionCustomFieldsAddTrigger
        entityDisplayName={t("plugins.defTitle")}
        onCreated={() => void refetchCustomFields()}
      />
    </section>
  );
}
