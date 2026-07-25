import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RoleDetailView = dynamic(
  () => import("@modules/identity/roles/src/presentation/views/RoleDetailView")
);

export const metadata: Metadata = {
  title: "Role Details",
  description: "View and manage role permissions and settings",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RolePage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="roles.roleDetails">
      <RoleDetailView roleId={id} />
    </ModuleErrorBoundary>
  );
}
