"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Sliders } from "lucide-react";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { CustomFieldsSection } from "@core/components/custom-fields";
import { DEFINITION_ENTITY_TYPE_KEY } from "../viewmodels/useDefinitionsViewModel";

interface DefinitionFormCustomFieldsSectionProps {
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  updateCustomFieldValue: (name: string, value: unknown) => void;
  refetchCustomFields: () => Promise<void>;
}

/**
 * Presentation UI component rendering the plugin definition form's custom
 * fields section using the shared CustomFieldsSection component.
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

      <CustomFieldsSection
        configs={customFieldConfigs}
        values={customFieldValues}
        onChange={updateCustomFieldValue}
        isLoading={customFieldsLoading}
        emptyMessage={t("plugins.defNoCustomFields")}
        entityTypeKey={DEFINITION_ENTITY_TYPE_KEY}
        entityDisplayName={t("plugins.defTitle")}
        onFieldCreated={() => void refetchCustomFields()}
        className="space-y-5"
      />
    </section>
  );
}
