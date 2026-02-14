import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { MenusView } from "@modules/system/menus";

export const metadata: Metadata = {
  title: "Menu Management | Verified",
  description: "Configure sidebar navigation menus and their ordering",
};

export default function MenusPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Menu Management">
        <MenusView />
      </ModuleErrorBoundary>
    </main>
  );
}
