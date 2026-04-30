import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const UsersView = dynamic(
  () =>
    import("@modules/identity/users/src/presentation/views/UsersView").then((m) => ({
      default: m.UsersView,
    }))
);

export const metadata: Metadata = {
  title: "Users | NEXORA",
  description: "Manage client user accounts and their access within tenants",
};

export default function UsersPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="User Management">
        <UsersView />
      </ModuleErrorBoundary>
    </main>
  );
}
