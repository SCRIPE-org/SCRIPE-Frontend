import { Metadata } from "next";
import { ProfileIntegrationsView } from "@modules/profile/core/src/presentation/views/ProfileIntegrationsView";

export const metadata: Metadata = {
  title: "SSO Federation & Developer Tokens • SCRIPE Profile",
  description: "Connected IdPs and personal access tokens",
};

export default function ProfileIntegrationsPage() {
  return <ProfileIntegrationsView />;
}
