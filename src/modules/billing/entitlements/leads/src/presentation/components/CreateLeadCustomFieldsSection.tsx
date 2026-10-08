"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Sliders } from "lucide-react";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { CustomFieldsSection } from "@core/components/custom-fields";
import { LEAD_ENTITY_TYPE_KEY } from "../viewmodels/useLeadsViewModel";

interface CreateLeadCustomFieldsSectionProps {
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (name: string, value: unknown) => void;
  onCustomFieldsCreated: () => void;
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
          <p className="text-xs text-nx-ink-2">{t("leads.createDialog.customFieldsSectionDesc")}</p>
        </div>
      </div>

      <CustomFieldsSection
        configs={customFieldConfigs}
        values={customFieldValues}
        onChange={onCustomFieldChange}
        isLoading={customFieldsLoading}
        emptyMessage={t("leads.createDialog.noCustomFields")}
        entityTypeKey={LEAD_ENTITY_TYPE_KEY}
        entityDisplayName={t("leads.createDialog.title")}
        onFieldCreated={onCustomFieldsCreated}
        className="space-y-5"
      />
    </section>
  );
}
