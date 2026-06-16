import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const InventoryProductsView = dynamic(() =>
  import("@/modules/mocks/mock-inventory").then((m) => ({ default: m.InventoryProductsView }))
);

export const metadata: Metadata = {
  title: "Inventory – Products | SCRIPE",
  description: "Product catalog management",
};

export default function InventoryProductsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Inventory Products">
        <InventoryProductsView />
      </ModuleErrorBoundary>
    </main>
  );
}
