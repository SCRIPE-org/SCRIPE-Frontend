import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ThemeManagementView = dynamic(
  () =>
    import("@modules/system/customization").then((m) => ({
      default: m.ThemeManagementView,
    }))
);

export const metadata: Metadata = {
  title: "Theme Management | NEXORA",
  description:
    "Manage, create, and organize login page themes for the marketplace",
};

export default function ThemeManagementPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Theme Management">
        <ThemeManagementView />
      </ModuleErrorBoundary>
    </main>
  );
}
