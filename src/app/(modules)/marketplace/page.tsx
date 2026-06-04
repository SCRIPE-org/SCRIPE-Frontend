import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const AppListingsView = dynamic(() =>
  import("@modules/marketplace").then((m) => ({ default: m.AppListingsView }))
);

export const metadata: Metadata = {
  title: "App Listings | Marketplace | SCRIPE",
  description:
    "Browse and manage all marketplace app listings — publish, feature, and set pricing.",
};

export default function MarketplacePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Marketplace">
        <AppListingsView />
      </ModuleErrorBoundary>
    </main>
  );
}
