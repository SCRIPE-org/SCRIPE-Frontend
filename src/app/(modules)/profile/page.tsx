import dynamic from "next/dynamic";

const ProfileGeneralView = dynamic(
  () =>
    import("@modules/profile/src/presentation/views/ProfileGeneralView").then((m) => ({
      default: m.ProfileGeneralView,
    }))
);

export const metadata = {
  title: "Profile | Verified",
  description: "Manage your profile settings",
};

export default function ProfilePage() {
  return <ProfileGeneralView />;
}
