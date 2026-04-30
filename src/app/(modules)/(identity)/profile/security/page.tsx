import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ProfileSecurityView = dynamic(
  () =>
    import("@modules/profile/src/presentation/views/ProfileSecurityView").then((m) => ({
      default: m.ProfileSecurityView,
    }))
);

export const metadata: Metadata = {
  title: "Security | NEXORA",
  description: "Manage your password, two-factor authentication, and security settings",
};

export default function ProfileSecurityPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Profile Security">
        <ProfileSecurityView />
      </ModuleErrorBoundary>
    </main>
  );
}
