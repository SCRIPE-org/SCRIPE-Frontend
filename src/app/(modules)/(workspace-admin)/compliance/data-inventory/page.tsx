import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const InventoryView = dynamic(() =>
  import("@modules/compliance/inventory").then((m) => ({ default: m.InventoryView }))
);

export const metadata: Metadata = {
  title: "Data Inventory",
  description:
    "View data inventory — browse all tracked personal data fields, legal bases, and export/anonymization configurations",
};

export default function ComplianceInventoryPage() {
  return (
    <ModuleErrorBoundary moduleName="compliance.dataInventory">
      <InventoryView />
    </ModuleErrorBoundary>
  );
}
