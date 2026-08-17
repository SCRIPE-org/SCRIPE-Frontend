"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Sliders } from "lucide-react";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import { renderCustomFieldControl } from "@modules/custom-fields/custom-field/src/presentation/renderCustomFieldControl";
import { WEBHOOK_ENTITY_TYPE_KEY, type WebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormCustomFieldsSectionProps {
  vm: WebhookFormViewModel;
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
        return renderCustomFieldControl({
          fc,
          value,
          onChange: (v) => vm.updateCustomFieldValue(fc.name, v),
        });
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
