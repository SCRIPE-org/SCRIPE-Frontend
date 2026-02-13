import { ProfileGeneralView } from "@modules/profile/src/presentation/views/ProfileGeneralView";

export const metadata = {
      title: "Profile | Verified",
      description: "Manage your profile settings",
};

export default function ProfilePage() {
      return <ProfileGeneralView />;
}
