import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AdminsView } from "@modules/system/admin";

export const metadata: Metadata = {
  title: "Admins | Verified",
  description: "Manage system administrators and their access levels",
};

export default function AdminsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Admin Management">
        <AdminsView />
      </ModuleErrorBoundary>
    </main>
  );
}
