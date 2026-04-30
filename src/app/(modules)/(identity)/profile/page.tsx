import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ProfileGeneralView = dynamic(
  () =>
    import("@modules/profile/src/presentation/views/ProfileGeneralView").then((m) => ({
      default: m.ProfileGeneralView,
    }))
);

export const metadata: Metadata = {
  title: "Profile | NEXORA",
  description: "Manage your profile information, avatar, and account preferences",
};

export default function ProfilePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Profile">
        <ProfileGeneralView />
      </ModuleErrorBoundary>
    </main>
  );
}
