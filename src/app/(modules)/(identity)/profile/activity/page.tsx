import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ProfileActivityView = dynamic(
  () =>
    import("@modules/profile/src/presentation/views/ProfileActivityView").then((m) => ({
      default: m.ProfileActivityView,
    }))
);

export const metadata: Metadata = {
  title: "Activity Log | NEXORA",
  description: "Review your security activity log and recent account actions",
};

export default function ProfileActivityPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Activity Log">
        <ProfileActivityView />
      </ModuleErrorBoundary>
    </main>
  );
}
