import { Metadata } from "next";
import { ProfilePreferencesView } from "@modules/profile/core/src/presentation/views/ProfilePreferencesView";

export const metadata: Metadata = {
  title: "Workstation Preferences • SCRIPE Profile",
  description: "Relay vNext themes, accent hues, density, and localization",
};

export default function ProfilePreferencesPage() {
  return <ProfilePreferencesView />;
}
