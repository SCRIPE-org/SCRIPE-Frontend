import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RecycleBinView = dynamic(() =>
  import("@modules/ecosystem/recycle-bin").then((m) => ({ default: m.RecycleBinView }))
);

export const metadata: Metadata = {
  title: "Recycle Bin",
  description: "View and restore recently soft-deleted items",
};

export default function RecycleBinPage() {
  return (
    <ModuleErrorBoundary moduleName="recycleBin.title">
      <RecycleBinView />
    </ModuleErrorBoundary>
  );
}
