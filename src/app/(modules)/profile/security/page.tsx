import dynamic from "next/dynamic";

const ProfileSecurityView = dynamic(
  () =>
    import("@modules/profile/src/presentation/views/ProfileSecurityView").then((m) => ({
      default: m.ProfileSecurityView,
    }))
);

export const metadata = {
  title: "Security | Verified",
  description: "Manage your password and two-factor authentication",
};

export default function ProfileSecurityPage() {
  return <ProfileSecurityView />;
}
