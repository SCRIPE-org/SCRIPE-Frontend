import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PermissionsView = dynamic(() =>
  import("@modules/identity/permissions").then((m) => ({ default: m.PermissionsView }))
);

export const metadata: Metadata = {
  title: "Permissions",
  description: "View and manage system-wide permission definitions",
};

export default function PermissionsPage() {
  return (
    <ModuleErrorBoundary moduleName="permission.title">
      <PermissionsView />
    </ModuleErrorBoundary>
  );
}
