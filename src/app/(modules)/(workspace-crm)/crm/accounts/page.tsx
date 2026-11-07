import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AccountsView } from "@modules/crm/accounts";

export const metadata: Metadata = {
  title: "Commercial Accounts 360 | SCRIPE CRM",
  description:
    "Enterprise sports operations CRM commercial account directory and 360 stakeholder intelligence.",
};

export default function CrmAccountsPage() {
  return (
    <ModuleErrorBoundary moduleName="crmAccounts.title">
      <AccountsView />
    </ModuleErrorBoundary>
  );
}
