/**
 * StaffMember Page
 *
 * Server component that imports and renders the StaffMember list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { StaffMemberListView } from "@modules/hrms/staff-member/src/presentation/views/StaffMemberListView";

export const metadata: Metadata = {
  title: "Staff Members",
  description: "Manage Staff Members",
};

export default function StaffMembersPage() {
  return (
    <ModuleErrorBoundary moduleName="staffMember.title">
      <StaffMemberListView />
    </ModuleErrorBoundary>
  );
}
