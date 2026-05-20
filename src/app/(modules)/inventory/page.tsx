import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const InventoryDashboardView = dynamic(() =>
  import("@modules/mock-inventory").then((m) => ({ default: m.InventoryDashboardView }))
);

export const metadata: Metadata = {
  title: "Inventory | NEXORA",
  description: "Inventory Management System",
};

export default function InventoryPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Inventory">
        <InventoryDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
