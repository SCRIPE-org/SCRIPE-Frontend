"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Sliders } from "lucide-react";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { renderCustomFieldControl } from "@modules/custom-fields/custom-field";
import { DEFINITION_ENTITY_TYPE_KEY } from "../viewmodels/useDefinitionsViewModel";

interface DefinitionFormCustomFieldsSectionProps {
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  updateCustomFieldValue: (name: string, value: unknown) => void;
  refetchCustomFields: () => Promise<void>;
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

      {customFieldConfigs
        // Same visibility check GenericForm's own `visibleFields` applies (generic-form.tsx) --
        // without it, a field carrying a visibility rule (customFieldsCrudIntegration.tsx attaches
        // one to `isVisible` whenever visibilityRules is non-empty) rendered unconditionally here.
        .filter((fc) => !fc.isVisible || fc.isVisible(customFieldValues))
        .map((fc) => {
          const value = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
          return renderCustomFieldControl({
            fc,
            value,
            onChange: (v) => updateCustomFieldValue(fc.name, v),
          });
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
