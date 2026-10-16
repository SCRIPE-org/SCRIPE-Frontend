"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Sliders } from "lucide-react";
import { CustomFieldsSection } from "@core/components/custom-fields";
import {
  WEBHOOK_ENTITY_TYPE_KEY,
  type WebhookFormViewModel,
} from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormCustomFieldsSectionProps {
  vm: WebhookFormViewModel;
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

      <CustomFieldsSection
        configs={vm.customFieldConfigs}
        values={vm.customFieldValues}
        onChange={vm.updateCustomFieldValue}
        isLoading={vm.customFieldsLoading}
        emptyMessage={t("webhooks.noCustomFields")}
        entityTypeKey={WEBHOOK_ENTITY_TYPE_KEY}
        entityDisplayName={t("webhooks.title")}
        onFieldCreated={() => void vm.refetchCustomFields()}
      />
    </section>
  );
}
