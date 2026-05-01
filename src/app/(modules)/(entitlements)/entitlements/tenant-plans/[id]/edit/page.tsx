import type { Metadata } from "next";
import { TenantPlanEditWizardView } from "@modules/entitlements/tenant-plans";

export const metadata: Metadata = {
  title: "Edit Tenant Plan",
};

export default function EditTenantPlanPage({ params }: { params: { id: string } }) {
  return <TenantPlanEditWizardView planId={params.id} />;
}
