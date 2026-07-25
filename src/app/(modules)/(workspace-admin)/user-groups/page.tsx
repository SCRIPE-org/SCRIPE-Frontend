import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const UserGroupsView = dynamic(() =>
  import("@modules/identity/user-groups/src/presentation/views/UserGroupsView").then((m) => ({
    default: m.UserGroupsView,
  }))
);

export const metadata: Metadata = {
  title: "User Groups",
  description: "Manage user groups for batch role and restriction assignment",
};

export default function UserGroupsPage() {
  return (
    <ModuleErrorBoundary moduleName="userGroups.title">
      <UserGroupsView />
    </ModuleErrorBoundary>
  );
}
