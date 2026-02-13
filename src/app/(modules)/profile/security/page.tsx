import { ProfileSecurityView } from "@modules/profile/src/presentation/views/ProfileSecurityView";

export const metadata = {
      title: "Security | Verified",
      description: "Manage your password and two-factor authentication",
};

export default function ProfileSecurityPage() {
      return <ProfileSecurityView />;
}
