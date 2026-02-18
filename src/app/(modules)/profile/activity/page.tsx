import dynamic from "next/dynamic";

const ProfileActivityView = dynamic(
  () =>
    import("@modules/profile/src/presentation/views/ProfileActivityView").then((m) => ({
      default: m.ProfileActivityView,
    }))
);

export const metadata = {
  title: "Activity Log | Verified",
  description: "Review your security activity log",
};

export default function ProfileActivityPage() {
  return <ProfileActivityView />;
}
