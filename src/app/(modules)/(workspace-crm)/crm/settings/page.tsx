import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CrmSettingsView } from "@modules/crm/overview";

export const metadata: Metadata = {
  title: "CRM Module Settings & Multi-Currency Engine | SCRIPE",
  description:
    "Configure CRM base reporting currency, live exchange rates, stage gate governance, SLAs, and Custom Fields Studio.",
};

export default function CrmSettingsPage() {
  return (
    <ModuleErrorBoundary moduleName="crm.tabs.settings">
      <CrmSettingsView />
    </ModuleErrorBoundary>
  );
}
