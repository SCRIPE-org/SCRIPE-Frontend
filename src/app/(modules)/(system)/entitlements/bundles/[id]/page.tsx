import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const BundleDetailView = dynamic(
      () => import("@modules/entitlements/bundles").then((m) => ({ default: m.BundleDetailView }))
);

export const metadata: Metadata = {
      title: "Bundle Rules | Verified",
      description: "Manage permission and feature rules for this bundle",
};

interface Props {
      params: Promise<{
            id: string;
      }>;
}

export default async function BundleDetailPage({ params }: Props) {
      const { id } = await params;

      return (
            <main>
                  <ModuleErrorBoundary moduleName="Bundle Rules Management">
                        <BundleDetailView bundleId={id} />
                  </ModuleErrorBoundary>
            </main>
      );
}
