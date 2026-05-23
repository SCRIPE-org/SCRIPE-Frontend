import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ProfileNotificationsView = dynamic(() =>
  import(
    "@modules/profile/src/presentation/views/ProfileNotificationsView"
  ).then((m) => ({
    default: m.ProfileNotificationsView,
  }))
);

export const metadata: Metadata = {
  title: "Notifications | NEXORA",
  description: "Manage your notification preferences and alert settings",
};

export default function ProfileNotificationsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Profile Notifications">
        <ProfileNotificationsView />
      </ModuleErrorBoundary>
    </main>
  );
}
