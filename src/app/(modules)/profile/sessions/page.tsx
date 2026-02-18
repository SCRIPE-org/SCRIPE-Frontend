import dynamic from "next/dynamic";

const ProfileSessionsView = dynamic(
  () =>
    import("@modules/profile/src/presentation/views/ProfileSessionsView").then((m) => ({
      default: m.ProfileSessionsView,
    }))
);

export const metadata = {
  title: "Sessions | Verified",
  description: "Manage your active login sessions",
};

export default function ProfileSessionsPage() {
  return <ProfileSessionsView />;
}
