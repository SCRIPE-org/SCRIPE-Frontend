import { ProfileActivityView } from "@modules/profile/src/presentation/views/ProfileActivityView";

export const metadata = {
  title: "Activity Log | Verified",
  description: "Review your security activity log",
};

export default function ProfileActivityPage() {
  return <ProfileActivityView />;
}
