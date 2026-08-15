import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const MenuCustomizeView = dynamic(() =>
  import("@modules/customization/menus/src/presentation/views/MenuCustomizeView").then((m) => ({
    default: m.MenuCustomizeView,
  }))
);

export const metadata: Metadata = {
  title: "Customize Menus",
  description: "Drag-and-drop menu customization with role-based visibility",
};

export default function MenuCustomizePage() {
  return (
    <ModuleErrorBoundary moduleName="menus.customizePage">
      <MenuCustomizeView />
    </ModuleErrorBoundary>
  );
}
