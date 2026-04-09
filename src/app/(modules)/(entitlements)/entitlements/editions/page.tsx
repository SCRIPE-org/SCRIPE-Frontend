import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionsView = dynamic(
      () => import("@modules/entitlements/editions").then((m) => ({ default: m.EditionsView }))
);

export const metadata: Metadata = {
      title: "Editions | NEXORA",
      description: "Manage subscription editions and plans",
};

export default function EditionsPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Edition Management">
                        <EditionsView />
                  </ModuleErrorBoundary>
            </main>
      );
}
