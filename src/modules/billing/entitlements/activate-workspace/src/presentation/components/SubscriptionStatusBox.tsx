import React from "react";
import { useI18n } from "@core/providers/i18n-provider";

interface SubscriptionStatusBoxProps {
  subscription:
    | {
        editionName: string;
        type: string;
        currency?: string;
      }
    | null
    | undefined;
}

/**
 * Presentation UI component rendering the subscription status box.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SubscriptionStatusBox({ subscription }: SubscriptionStatusBoxProps) {
  const { t } = useI18n();

  if (!subscription) return null;

  return (
    <div className="space-y-2 rounded-nx-md border border-nx-line bg-nx-raised p-4 text-sm">
      <div className="mb-2 flex items-center justify-between border-b border-nx-line pb-2">
        <span className="font-medium text-nx-ink-2">
          {t("entitlements.activateWorkspace.statusBox.selectedPlan")}
        </span>
        <span className="text-base font-semibold text-nx-accent">{subscription.editionName}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-nx-ink-3">
          {t("entitlements.activateWorkspace.statusBox.billingCycle")}
        </span>
        <span className="font-medium text-nx-ink-2">
          {subscription.type === "Monthly"
            ? t("entitlements.activateWorkspace.monthly")
            : t("entitlements.activateWorkspace.yearly")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-nx-ink-3">
          {t("entitlements.activateWorkspace.statusBox.currency")}
        </span>
        <span className="font-medium uppercase text-nx-ink-2">{subscription.currency}</span>
      </div>
    </div>
  );
}
