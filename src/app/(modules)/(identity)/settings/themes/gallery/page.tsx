import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ThemeGalleryView = dynamic(
  () =>
    import("@/modules/identity/customization").then((m) => ({
      default: m.ThemeGalleryView,
    }))
);

export const metadata: Metadata = {
  title: "Theme Gallery | NEXORA",
  description:
    "Browse, preview, and apply stunning login page themes from the NEXORA theme marketplace",
};

export default function ThemeGalleryPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Theme Gallery">
        <ThemeGalleryView />
      </ModuleErrorBoundary>
    </main>
  );
}
