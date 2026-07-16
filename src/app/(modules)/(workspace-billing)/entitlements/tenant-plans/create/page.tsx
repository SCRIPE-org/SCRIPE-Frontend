import type { Metadata } from "next";
import { TenantPlanWizardView } from "@modules/entitlements/tenant-plans";

export const metadata: Metadata = {
  title: "Create Tenant Plan",
};

export default function CreateTenantPlanPage() {
  return <TenantPlanWizardView />;
}
