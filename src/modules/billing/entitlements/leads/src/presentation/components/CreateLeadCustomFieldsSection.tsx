"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Sliders } from "lucide-react";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { renderCustomFieldControl } from "@modules/custom-fields/custom-field";
import { LEAD_ENTITY_TYPE_KEY } from "../viewmodels/useLeadsViewModel";

interface CreateLeadCustomFieldsSectionProps {
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (name: string, value: unknown) => void;
  onCustomFieldsCreated: () => void;
}

/** Mirrors WebhookFormCustomFieldsSection.tsx's own private add-trigger wrapper. */
function LeadCustomFieldsAddTrigger({
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
      entityTypeKey={LEAD_ENTITY_TYPE_KEY}
      entityDisplayName={entityDisplayName}
      onCreated={onCreated}
    />
  );
}

/**
 * Presentation UI component rendering the create-lead custom fields section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CreateLeadCustomFieldsSection({
  customFieldConfigs,
  customFieldsLoading,
  customFieldValues,
  onCustomFieldChange,
  onCustomFieldsCreated,
}: CreateLeadCustomFieldsSectionProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-5 border-t border-nx-line pt-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash text-nx-accent">
          <Sliders className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-nx-ink">
            {t("leads.createDialog.customFieldsSection")}
          </h3>
          <p className="text-xs text-nx-ink-2">
            {t("leads.createDialog.customFieldsSectionDesc")}
          </p>
        </div>
      </div>

      {customFieldConfigs.map((fc) => {
        const value = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
        return renderCustomFieldControl({
          fc,
          value,
          onChange: (v) => onCustomFieldChange(fc.name, v),
        });
      })}

      {customFieldConfigs.length === 0 && !customFieldsLoading && (
        <p className="text-sm text-nx-ink-2">{t("leads.createDialog.noCustomFields")}</p>
      )}

      <LeadCustomFieldsAddTrigger
        entityDisplayName={t("leads.createDialog.title")}
        onCreated={onCustomFieldsCreated}
      />
    </section>
  );
}
