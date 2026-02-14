import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { RolesView } from "@modules/system/roles";

export const metadata: Metadata = {
  title: "Roles | Verified",
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
