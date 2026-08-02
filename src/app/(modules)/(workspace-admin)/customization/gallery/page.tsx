import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ThemeGalleryView = dynamic(() =>
  import("@modules/customization/branding").then((m) => ({
    default: m.ThemeGalleryView,
  }))
);

export const metadata: Metadata = {
  title: "Theme Gallery",
  description:
    "Browse, preview, and apply stunning login page themes from the SCRIPE theme marketplace",
};

export default function ThemeGalleryPage() {
  return (
    <ModuleErrorBoundary moduleName="studio.marketplace.title">
      <ThemeGalleryView />
    </ModuleErrorBoundary>
  );
}
