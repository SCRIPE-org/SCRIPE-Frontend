import { ProfileSessionsView } from "@modules/profile/src/presentation/views/ProfileSessionsView";

export const metadata = {
  title: "Sessions | Verified",
  description: "Manage your active login sessions",
};

export default function ProfileSessionsPage() {
  return <ProfileSessionsView />;
}
