import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ProfileSettingsView = dynamic(() =>
  import("@modules/profile/core/src/presentation/views/ProfileSettingsView").then((m) => ({
    default: m.ProfileSettingsView,
  }))
);

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your personal profile, security, sessions, and activity",
};

export default function ProfilePage() {
  return (
    <ModuleErrorBoundary moduleName="profile.title">
      <ProfileSettingsView />
    </ModuleErrorBoundary>
  );
}
