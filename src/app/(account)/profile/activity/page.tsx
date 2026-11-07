import { Metadata } from "next";
import { ProfileActivityView } from "@modules/profile/core/src/presentation/views/ProfileActivityView";

export const metadata: Metadata = {
  title: "SOC2 Compliance Audit Trail • SCRIPE Profile",
  description: "Tamper-evident system activity log and forensic JSON inspection",
};

export default function ProfileActivityPage() {
  return <ProfileActivityView />;
}
