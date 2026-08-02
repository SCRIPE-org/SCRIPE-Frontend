import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const UserGroupDetailView = dynamic(() =>
  import("@modules/identity/user-groups/src/presentation/views/UserGroupDetailView").then((m) => ({
    default: m.UserGroupDetailView,
  }))
);

export const metadata: Metadata = {
  title: "User Group Detail",
  description: "View and manage user group details, members, roles, and restrictions",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserGroupDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="userGroups.detailTitle">
      <UserGroupDetailView groupId={id} />
    </ModuleErrorBoundary>
  );
}
