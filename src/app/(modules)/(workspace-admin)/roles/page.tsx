import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RolesView = dynamic(() =>
  import("@modules/identity/roles").then((m) => ({ default: m.RolesView }))
);

export const metadata: Metadata = {
  title: "Roles | SCRIPE",
  description: "Configure roles and their associated permissions",
};

export default function RolesPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Role Management">
        <RolesView />
      </ModuleErrorBoundary>
    </main>
  );
}
