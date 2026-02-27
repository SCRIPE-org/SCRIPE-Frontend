import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const AdminsView = dynamic(
  () => import("@modules/system/admin").then((m) => ({ default: m.AdminsView }))
);

export const metadata: Metadata = {
  title: "Admins | NEXORA",
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
