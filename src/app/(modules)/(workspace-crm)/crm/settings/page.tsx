import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CrmSettingsView } from "@modules/crm/settings";

export const metadata: Metadata = {
  title: "CRM Settings & Governance | SCRIPE",
  description:
    "Server-persisted tenant CRM governance, multi-currency FX rules, custom fields studio, and pipeline roles.",
};

/**
 * Next.js App Router entry point for CRM Tenant Governance & Currency Settings.
 */
export default function CrmSettingsPage() {
  return (
    <ModuleErrorBoundary moduleName="crm.settings.title">
      <CrmSettingsView />
    </ModuleErrorBoundary>
  );
}
