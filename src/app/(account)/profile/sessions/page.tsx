import { Metadata } from "next";
import { ProfileSessionsView } from "@modules/profile/core/src/presentation/views/ProfileSessionsView";

export const metadata: Metadata = {
  title: "Workstations & Session Fleet • SCRIPE Profile",
  description: "Active concurrent sessions, device telemetry, and cluster revocation",
};

export default function ProfileSessionsPage() {
  return <ProfileSessionsView />;
}
