import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ProfileSessionsView = dynamic(() =>
  import("@modules/profile/src/presentation/views/ProfileSessionsView").then((m) => ({
    default: m.ProfileSessionsView,
  }))
);

export const metadata: Metadata = {
  title: "Sessions | NEXORA",
  description: "View and manage your active login sessions across all devices",
};

export default function ProfileSessionsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Profile Sessions">
        <ProfileSessionsView />
      </ModuleErrorBoundary>
    </main>
  );
}
