"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { DatePicker } from "@core/ui/date-picker";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Sliders } from "lucide-react";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import { WEBHOOK_ENTITY_TYPE_KEY, type WebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormCustomFieldsSectionProps {
  vm: WebhookFormViewModel;
}

function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

/** Mirrors TemplateFormView.tsx's own private CustomFieldsAddTrigger wrapper. */
function WebhookCustomFieldsAddTrigger({
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
      entityTypeKey={WEBHOOK_ENTITY_TYPE_KEY}
      entityDisplayName={entityDisplayName}
      onCreated={onCreated}
    />
  );
}

/**
 * Presentation UI component rendering the webhook form custom fields section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhookFormCustomFieldsSection({ vm }: WebhookFormCustomFieldsSectionProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash text-nx-accent">
          <Sliders className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-nx-ink">
            {t("webhooks.form.customFieldsSection")}
          </h3>
          <p className="text-xs text-nx-ink-2">{t("webhooks.form.customFieldsSectionDesc")}</p>
        </div>
      </div>

      {vm.customFieldConfigs.map((fc) => {
        const value = vm.customFieldValues[fc.name] ?? fc.defaultValue ?? "";

        if (fc.type === "switch") {
          return (
            <div key={fc.name} className="flex items-center justify-between">
              <Label htmlFor={fc.name} className="text-sm font-medium">
                {fc.label}
              </Label>
              <Switch
                id={fc.name}
                checked={Boolean(value)}
                onCheckedChange={(v) => vm.updateCustomFieldValue(fc.name, v)}
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
                onValueChange={(v: string | string[]) => vm.updateCustomFieldValue(fc.name, v as string)}
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
                onChange={(v) => vm.updateCustomFieldValue(fc.name, v)}
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
              onChange={(e) => vm.updateCustomFieldValue(fc.name, e.target.value)}
              placeholder={fc.placeholder}
              required={fc.required}
              className="text-sm"
            />
          </div>
        );
      })}

      {vm.customFieldConfigs.length === 0 && !vm.customFieldsLoading && (
        <p className="text-sm text-nx-ink-2">{t("webhooks.noCustomFields")}</p>
      )}

      <WebhookCustomFieldsAddTrigger
        entityDisplayName={t("webhooks.title")}
        onCreated={() => void vm.refetchCustomFields()}
      />
    </section>
  );
}
