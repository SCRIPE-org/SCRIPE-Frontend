import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const MenusView = dynamic(() =>
  import("@modules/customization/menus").then((m) => ({ default: m.MenusView }))
);

export const metadata: Metadata = {
  title: "Menu Management | SCRIPE",
  description: "Manage sidebar navigation menus and menu items",
};

export default function MenusPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Menus">
        <MenusView />
      </ModuleErrorBoundary>
    </main>
  );
}
