import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const MenusView = dynamic(
  () => import("@/modules/identity/menus").then((m) => ({ default: m.MenusView }))
);

export const metadata: Metadata = {
  title: "Menu Management | NEXORA",
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
