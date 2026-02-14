import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import RoleDetailView from "@modules/system/roles/src/presentation/views/RoleDetailView";

export const metadata: Metadata = {
  title: "Role Details | Verified",
  description: "View and manage role permissions and settings",
};

export default function RolePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Role Details">
        <RoleDetailView />
      </ModuleErrorBoundary>
    </main>
  );
}
