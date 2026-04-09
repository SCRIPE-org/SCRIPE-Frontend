import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RoleDetailView = dynamic(
  () => import("@modules/identity/roles/src/presentation/views/RoleDetailView")
);

export const metadata: Metadata = {
  title: "Role Details | NEXORA",
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
