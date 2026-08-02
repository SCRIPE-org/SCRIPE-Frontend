import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionsView = dynamic(() =>
  import("@modules/entitlements/editions").then((m) => ({ default: m.EditionsView }))
);

export const metadata: Metadata = {
  title: "Editions",
  description: "Manage subscription editions and plans",
};

export default function EditionsPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.editions.title">
      <EditionsView />
    </ModuleErrorBoundary>
  );
}
