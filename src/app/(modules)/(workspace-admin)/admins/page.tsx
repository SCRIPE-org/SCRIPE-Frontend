import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const AdminsView = dynamic(() =>
  import("@modules/identity/admin").then((m) => ({ default: m.AdminsView }))
);

export const metadata: Metadata = {
  title: "Admins",
  description: "Manage system administrators and their access levels",
};

export default function AdminsPage() {
  return (
    <ModuleErrorBoundary moduleName="admin.title">
      <AdminsView />
    </ModuleErrorBoundary>
  );
}
