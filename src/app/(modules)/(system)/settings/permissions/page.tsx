import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PermissionsView = dynamic(
  () => import("@modules/system/permissions").then((m) => ({ default: m.PermissionsView }))
);

export const metadata: Metadata = {
  title: "Permissions | NEXORA",
  description: "View and manage system-wide permission definitions",
};

export default function PermissionsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Permission Management">
        <PermissionsView />
      </ModuleErrorBoundary>
    </main>
  );
}
