import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const BundlesView = dynamic(
      () => import("@modules/entitlements/bundles").then((m) => ({ default: m.BundlesView }))
);

export const metadata: Metadata = {
      title: "Permission Bundles | Verified",
      description: "Manage permission bundles and package rules",
};

export default function BundlesPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Bundle Management">
                        <BundlesView />
                  </ModuleErrorBoundary>
            </main>
      );
}
